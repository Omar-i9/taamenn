import { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Match, MatchType } from '../data/footballData';
import { addMatchToArchive } from '../services/archiveRepository';

type Language = 'ar' | 'en';

interface AddArchiveModalProps {
  language: Language;
  onClose: () => void;
}

export default function AddArchiveModal({ language, onClose }: AddArchiveModalProps) {
  const ar = language === 'ar';
  
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [stadium, setStadium] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<MatchType>('friendly');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeLabel = (v: string) => ({
    friendly: ar ? 'ودية' : 'Friendly',
    normal: ar ? 'عادية' : 'Normal',
    competitive: ar ? 'تنافسية' : 'Competitive',
    tournament: ar ? 'بطولة' : 'Tournament',
    strong: ar ? 'قوية' : 'Strong'
  } as Record<string, string>)[v] || v;

  const validateTimestamp = (): boolean => {
    if (!date || !time) {
      setError(ar ? 'يرجى اختيار التاريخ والوقت' : 'Please select date and time');
      return false;
    }

    const matchDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (matchDateTime > now) {
      const hoursUntil = Math.floor((matchDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
      const minutesUntil = Math.floor(((matchDateTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hoursUntil > 0) {
        setError(ar 
          ? `المباراة ستحدث بعد ${hoursUntil} ساعة و ${minutesUntil} دقيقة. لا يمكن أرشفة مباريات مستقبلية.` 
          : `This match is ${hoursUntil} hours and ${minutesUntil} minutes in the future. Future matches cannot be archived.`
        );
      } else {
        setError(ar 
          ? `المباراة ستحدث بعد ${minutesUntil} دقيقة. لا يمكن أرشفة مباريات مستقبلية.` 
          : `This match is ${minutesUntil} minutes in the future. Future matches cannot be archived.`
        );
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!team1.trim() || !team2.trim()) {
      setError(ar ? 'يرجى إدخال اسم الفريقين' : 'Please enter both team names');
      return;
    }

    if (!validateTimestamp()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const matchDateTime = new Date(`${date}T${time}`);
      const dateKey = matchDateTime.getTime();
      
      const newMatch: Match = {
        id: `archive-${Date.now()}`,
        team1: team1.trim(),
        team2: team2.trim(),
        score1: parseInt(score1) || 0,
        score2: parseInt(score2) || 0,
        dateISO: matchDateTime.toISOString(),
        dateKey,
        dateLabel: matchDateTime.toLocaleDateString(ar ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        stadium: stadium.trim() || undefined,
        city: city.trim() || undefined,
        type,
        status: 'ARCHIVED',
        visibility: 'LOCAL',
        story: '',
        source: 'local',
        createdAt: Date.now()
      };

      await addMatchToArchive(newMatch);
      onClose();
    } catch (err) {
      setError(ar ? 'فشل حفظ المباراة' : 'Failed to save match');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <button className="overlay-backdrop" onClick={onClose} />
      <aside className="modal-card archive-modal">
        <header>
          <div>
            <span className="eyebrow">TAAMEN / ARCHIVE</span>
            <h2>{ar ? 'إضافة مباراة مؤرشفة' : 'Add Archived Match'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X />
          </button>
        </header>

        <form className="archive-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              {ar ? 'الفريق الأول' : 'Team 1'} <span className="required">*</span>
              <input
                required
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                placeholder={ar ? 'اسم الفريق' : 'Team name'}
              />
            </label>
            <label>
              {ar ? 'الفريق الثاني' : 'Team 2'} <span className="required">*</span>
              <input
                required
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                placeholder={ar ? 'اسم الفريق' : 'Team name'}
              />
            </label>
            <label>
              {ar ? 'نتيجة الفريق الأول' : 'Team 1 Score'}
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                placeholder="0"
              />
            </label>
            <label>
              {ar ? 'نتيجة الفريق الثاني' : 'Team 2 Score'}
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              {ar ? 'التاريخ' : 'Date'} <span className="required">*</span>
              <div className="date-time-input">
                <Calendar size={16} />
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </label>
            <label>
              {ar ? 'الوقت' : 'Time'} <span className="required">*</span>
              <div className="date-time-input">
                <Clock size={16} />
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="form-grid">
            <label>
              {ar ? 'الملعب' : 'Stadium'}
              <input
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                placeholder={ar ? 'اسم الملعب' : 'Stadium name'}
              />
            </label>
            <label>
              {ar ? 'المدينة' : 'City'}
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={ar ? 'اسم المدينة' : 'City name'}
              />
            </label>
          </div>

          <label>
            {ar ? 'نوع المباراة' : 'Match Type'}
            <select value={type} onChange={(e) => setType(e.target.value as MatchType)}>
              <option value="friendly">{typeLabel('friendly')}</option>
              <option value="normal">{typeLabel('normal')}</option>
              <option value="competitive">{typeLabel('competitive')}</option>
              <option value="tournament">{typeLabel('tournament')}</option>
              <option value="strong">{typeLabel('strong')}</option>
            </select>
          </label>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="dark-action" onClick={onClose}>
              {ar ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" className="primary-action" disabled={isSubmitting}>
              {isSubmitting ? (ar ? 'جاري الحفظ...' : 'Saving...') : (ar ? 'حفظ المباراة' : 'Save Match')}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
