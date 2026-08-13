window.TAAMEN_MAINTENANCE_CONFIG = Object.freeze({
  enabled: true,

  /*
   * 2027-07-01 00:00:00
   * Asia/Hebron / Palestine
   *
   * 2027-07-01 is currently expected to be UTC+3,
   * therefore the equivalent UTC instant is 2027-06-30T21:00:00Z.
   *
   * Keep the UTC instant here so the countdown is consistent
   * for every visitor regardless of their device timezone.
   */
  reopenAtUTC: "2027-06-30T21:00:00.000Z",

  timezoneLabel: "بتوقيت فلسطين",

  adminLink: "https://omar-i9.github.io/omar-i9/",

  title: "تأمين 2026",
  edition: "Legacy Edition",

  autoRestore: true,

  /*
   * After reaching zero, give the visitor a short visual transition
   * before loading the real application.
   */
  restoreTransitionMs: 2200
});