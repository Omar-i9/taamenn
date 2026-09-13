export type Stadium = {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  locationAr?: string;
  locationEn?: string;
  contactPhone?: string;
  descriptionAr?: string;
  descriptionEn?: string;
};

export const stadiums: Stadium[] = [
  {
    id: 'stadium-qasrawi',
    nameAr: 'ملعب القصرواي',
    nameEn: 'Al Qasrawi Stadium',
    cityAr: 'الخليل',
    cityEn: 'Hebron',
    locationAr: 'مفرق المدارس، أول نزول حارة الزغير',
    locationEn: 'Schools Junction, first descent of Harat Al-Zughair',
    contactPhone: '+972 59-472-3000',
    descriptionAr: 'ملعب رياضي في الخليل',
    descriptionEn: 'Sports stadium in Hebron'
  },
  {
    id: 'stadium-ahli',
    nameAr: 'ملعب الأهلي',
    nameEn: 'Al Ahli Stadium',
    cityAr: 'الخليل',
    cityEn: 'Hebron',
    locationAr: 'أول طلعة المستشفى الأهلي القديمة',
    locationEn: 'First ascent of the old Al Ahli Hospital',
    contactPhone: '+972 59-555-0322',
    descriptionAr: 'ملعب رياضي في الخليل',
    descriptionEn: 'Sports stadium in Hebron'
  },
  {
    id: 'stadium-women',
    nameAr: 'ملعب سيدات الخليل',
    nameEn: 'Hebron Women Stadium',
    cityAr: 'الخليل',
    cityEn: 'Hebron',
    locationAr: 'مفرق الأهلي، جمعية سيدات الخليل',
    locationEn: 'Al Ahli Junction, Hebron Women Association',
    contactPhone: '+972 59-784-1444',
    descriptionAr: 'ملعب رياضي للسيدات في الخليل',
    descriptionEn: 'Women sports stadium in Hebron'
  },
  {
    id: 'stadium-shareef',
    nameAr: 'ملاعب الشريف',
    nameEn: 'Al Shareef Stadiums',
    cityAr: 'الخليل',
    cityEn: 'Hebron',
    locationAr: 'مفرق الجامعة، خلف مول السلايمة',
    locationEn: 'University Junction, behind Al-Salaymeh Mall',
    contactPhone: '+972 59-479-7777',
    descriptionAr: 'ملاعب رياضية في الخليل',
    descriptionEn: 'Sports stadiums in Hebron'
  },
  {
    id: 'stadium-salam',
    nameAr: 'ملعب السلام',
    nameEn: 'Al Salam Stadium',
    cityAr: 'الخليل',
    cityEn: 'Hebron',
    locationAr: 'شارع السلام بالقرب من أفوكادو',
    locationEn: 'Al Salam Street near Avocado',
    contactPhone: '+972 59-995-1151',
    descriptionAr: 'ملعب رياضي في الخليل',
    descriptionEn: 'Sports stadium in Hebron'
  }
];

export function getStadiumById(id: string): Stadium | undefined {
  return stadiums.find(s => s.id === id);
}

export function searchStadiums(query: string, language: 'ar' | 'en'): Stadium[] {
  if (!query.trim()) return stadiums;
  
  const normalizedQuery = normalizeArabicText(query.toLowerCase().trim());
  
  return stadiums.filter(stadium => {
    const nameText = language === 'ar' ? stadium.nameAr : stadium.nameEn;
    const cityText = language === 'ar' ? stadium.cityAr : stadium.cityEn;
    const locationText = language === 'ar' ? stadium.locationAr || '' : stadium.locationEn || '';
    
    const normalizedFields = [
      normalizeArabicText(nameText.toLowerCase()),
      normalizeArabicText(cityText.toLowerCase()),
      normalizeArabicText(locationText.toLowerCase())
    ];
    
    return normalizedFields.some(field => field.includes(normalizedQuery));
  });
}

function normalizeArabicText(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[هة]/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .replace(/[وؤ]/g, 'و')
    .replace(/\s+/g, ' ')
    .trim();
}
