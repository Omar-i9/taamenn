export type Language = 'ar'|'en';

export const archiveCopy = {
 ar:{
  homeEyebrow:'TAAMEN 2.0 / الرئيسية', welcome:'أهلًا', homeDesc:'كرة القدم كما يجب أن تُعرض: هادئة، واضحة، ومحلية أولًا.',
  exploreArchive:'استكشف السجل', profile:'الملف الشخصي', archive:'السجل', latestMatches:'أحدث المواجهات', viewAll:'عرض الكل',
  archiveHistory:'السجل التاريخي', archiveDesc:'المباريات التاريخية المعروفة من مصدر TAAMEN القديم، مع الحفاظ على الحقول غير المتوفرة دون اختلاق.',
  search:'ابحث عن فريق أو ملعب…', allTypes:'كل الأنواع', type:'النوع:', all:'الكل', source:'المصدر: أرشيف TAAMEN القديم',
  matches:'مباراة', noResults:'لا توجد نتائج', tryAgain:'جرّب كلمة بحث أو نوعًا آخر.',
  friendly:'ودية', normal:'عادية', competitive:'تنافسية', tournament:'بطولة', strong:'قوية', other:'أخرى',
  winner:'الفائز', draw:'تعادل', goals:'الأهداف', shots:'تسديدات', oppShots:'تسديدات الخصم', time:'الساعة',
  archiveCount:'سجل TAAMEN', decided:'المواجهات الحاسمة', decidedNote:'نتيجة غير متعادلة', draws:'التعادلات', drawsNote:'بدون فائز', historicalSource:'سجلات تاريخية محققة المصدر'
 },
 en:{
  homeEyebrow:'TAAMEN 2.0 / HOME', welcome:'Welcome', homeDesc:'Football presented as it should be: calm, clear, and local-first.',
  exploreArchive:'Explore archive', profile:'Profile', archive:'Archive', latestMatches:'Latest matches', viewAll:'View all',
  archiveHistory:'Historical Archive', archiveDesc:'Known historical TAAMEN matches, preserving unavailable source fields instead of inventing them.',
  search:'Search team or stadium…', allTypes:'All types', type:'Type:', all:'All', source:'Source: legacy TAAMEN archive',
  matches:'matches', noResults:'No matches found', tryAgain:'Try another search or match type.',
  friendly:'Friendly', normal:'Normal', competitive:'Competitive', tournament:'Tournament', strong:'Strong', other:'Other',
  winner:'Winner', draw:'Draw', goals:'Goals', shots:'Shots', oppShots:'Opp. shots', time:'Time',
  archiveCount:'TAAMEN archive', decided:'Decided matches', decidedNote:'non-draw results', draws:'Draws', drawsNote:'no winner', historicalSource:'historical source-backed records'
 }
} as const;
