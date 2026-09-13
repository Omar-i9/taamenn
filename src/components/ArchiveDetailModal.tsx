import { useState } from 'react';
import { X, Share2, Trophy, Calendar, MapPin, Shield } from 'lucide-react';
import type { Match, PlayerContribution } from '../data/footballData';
import { shareMatch } from '../services/shareService';

type Language = 'ar' | 'en';

interface ArchiveDetailModalProps {
  match: Match;
  language: Language;
  featured?: boolean;
  onClose: () => void;
  onShare?: () => void;
}

function calculateTotal(contribution: PlayerContribution): number {
  return contribution.goals + contribution.assists;
}

export default function ArchiveDetailModal({ match, language, featured = false, onClose, onShare }: ArchiveDetailModalProps) {
  const ar = language === 'ar';
  const [includeContributions, setIncludeContributions] = useState(true);
  
  const winner = match.score1 > match.score2 ? 'team1' : match.score2 > match.score1 ? 'team2' : null;
  const isDraw = match.score1 === match.score2;
  
  const hasContributions = match.playerContributions && 
    (match.playerContributions.team1.length > 0 || match.playerContributions.team2.length > 0);

  // Private records are refused by shareService; don't offer an action that must fail.
  const shareable = match.visibility !== 'PRIVATE';
  
  const handleShare = async () => {
    try {
      await shareMatch(match, { includeContributions: hasContributions ? includeContributions : false });
      if (onShare) onShare();
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={ar ? 'تفاصيل المباراة' : 'Match details'}>
      <button className="overlay-backdrop" aria-label="close" onClick={onClose} />
      <aside className="archive-detail-modal">
        <header>
          <div>
            <span className="eyebrow">ARCHIVE / DETAIL</span>
            <h2>{ar ? 'تفاصيل المباراة' : 'Match Details'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X />
          </button>
        </header>
        
        <div className="archive-detail-content">
          <div className="match-header">
            <div className="match-scoreboard">
              <div className={`team-score ${winner === 'team1' ? 'winner' : ''}`}>
                <span className="team-name">{match.team1}</span>
                <span className="score">{match.score1}</span>
              </div>
              <div className="match-divider">
                {isDraw ? <Shield size={20} /> : <Trophy size={20} />}
              </div>
              <div className={`team-score ${winner === 'team2' ? 'winner' : ''}`}>
                <span className="team-name">{match.team2}</span>
                <span className="score">{match.score2}</span>
              </div>
            </div>
            
            {winner && (
              <div className="winner-banner">
                <Trophy size={16} />
                <span>{ar ? `الفائز: ${winner === 'team1' ? match.team1 : match.team2}` : `Winner: ${winner === 'team1' ? match.team1 : match.team2}`}</span>
              </div>
            )}
          </div>

          <div className="match-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{match.dateLabel}</span>
            </div>
            {match.stadium && (
              <div className="meta-item">
                <MapPin size={16} />
                <span>{match.stadium}</span>
              </div>
            )}
            {match.city && (
              <div className="meta-item">
                <span>{match.city}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="match-type">{match.type}</span>
            </div>
          </div>

          {match.story && (
            <div className="match-story">
              <p>{match.story}</p>
            </div>
          )}

          {hasContributions && (
            <div className="contributions-section">
              <h3>{ar ? 'مساهمات اللاعبين' : 'Player Contributions'}</h3>
              
              {match.playerContributions!.team1.length > 0 && (
                <div className="team-contributions">
                  <h4>{match.team1}</h4>
                  <table className="contributions-table">
                    <thead>
                      <tr>
                        <th>{ar ? 'اللاعب' : 'Player'}</th>
                        <th>{ar ? 'الأهداف' : 'Goals'}</th>
                        <th>{ar ? 'التسديدات' : 'Assists'}</th>
                        <th>{ar ? 'المجموع' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {match.playerContributions!.team1.map((contrib, idx) => (
                        <tr key={idx}>
                          <td>{contrib.playerName}</td>
                          <td>{contrib.goals}</td>
                          <td>{contrib.assists}</td>
                          <td className="total-cell">{calculateTotal(contrib)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {match.playerContributions!.team2.length > 0 && (
                <div className="team-contributions">
                  <h4>{match.team2}</h4>
                  <table className="contributions-table">
                    <thead>
                      <tr>
                        <th>{ar ? 'اللاعب' : 'Player'}</th>
                        <th>{ar ? 'الأهداف' : 'Goals'}</th>
                        <th>{ar ? 'التسديدات' : 'Assists'}</th>
                        <th>{ar ? 'المجموع' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {match.playerContributions!.team2.map((contrib, idx) => (
                        <tr key={idx}>
                          <td>{contrib.playerName}</td>
                          <td>{contrib.goals}</td>
                          <td>{contrib.assists}</td>
                          <td className="total-cell">{calculateTotal(contrib)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button className="dark-action" onClick={onClose}>
              {ar ? 'إغلاق' : 'Close'}
            </button>
            {shareable && (
              <button className="primary-action" onClick={handleShare}>
                <Share2 size={16} />
                {ar ? 'مشاركة' : 'Share'}
              </button>
            )}
          </div>

          {!shareable && (
            <p className="settings-note">
              {ar ? 'السجلات الخاصة غير قابلة للمشاركة العامة.' : 'Private records cannot be shared publicly.'}
            </p>
          )}

          {shareable && hasContributions && (
            <div className="share-toggle">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={includeContributions}
                  onChange={(e) => setIncludeContributions(e.target.checked)}
                />
                <span>{ar ? 'تضمين مساهمات اللاعبين في المشاركة' : 'Include player contributions in share'}</span>
              </label>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
