export const CONFIG = {
  storagePrefix: 'taamen-legacy:',
  defaultCity: 'hebron',
  defaultTheme: 'night',
  cities: {
    hebron: {
      key: 'hebron',
      name: 'الخليل',
      country: 'فلسطين',
      lat: 31.5326,
      lon: 35.0998,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    jerusalem: {
      key: 'jerusalem',
      name: 'القدس',
      country: 'فلسطين',
      lat: 31.7683,
      lon: 35.2137,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    ramallah: {
      key: 'ramallah',
      name: 'رام الله',
      country: 'فلسطين',
      lat: 31.9038,
      lon: 35.2034,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    jenin: {
      key: 'jenin',
      name: 'جنين',
      country: 'فلسطين',
      lat: 32.4594,
      lon: 35.3009,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    nablus: {
      key: 'nablus',
      name: 'نابلس',
      country: 'فلسطين',
      lat: 32.2211,
      lon: 35.2544,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    gaza: {
      key: 'gaza',
      name: 'غزة',
      country: 'فلسطين',
      lat: 31.5017,
      lon: 34.4668,
      timezone: 'Asia/Gaza',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    bethlehem: {
      key: 'bethlehem',
      name: 'بيت لحم',
      country: 'فلسطين',
      lat: 31.7054,
      lon: 35.2024,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    acre: {
      key: 'acre',
      name: 'عكا',
      country: 'فلسطين',
      lat: 32.9239,
      lon: 35.0714,
      timezone: 'Asia/Jerusalem',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    tulkarm: {
      key: 'tulkarm',
      name: 'طولكرم',
      country: 'فلسطين',
      lat: 32.3104,
      lon: 35.0286,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    qalqilya: {
      key: 'qalqilya',
      name: 'قلقيلية',
      country: 'فلسطين',
      lat: 32.1960,
      lon: 34.9815,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    jericho: {
      key: 'jericho',
      name: 'أريحا',
      country: 'فلسطين',
      lat: 31.8560,
      lon: 35.4599,
      timezone: 'Asia/Hebron',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    rafah: {
      key: 'rafah',
      name: 'رفح',
      country: 'فلسطين',
      lat: 31.2969,
      lon: 34.2435,
      timezone: 'Asia/Gaza',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    },
    khan_younis: {
      key: 'khan_younis',
      name: 'خان يونس',
      country: 'فلسطين',
      lat: 31.3462,
      lon: 34.3063,
      timezone: 'Asia/Gaza',
      prayerMethod: 3,
      prayerMethodLabel: 'Muslim World League'
    }
  },
  weather: {
    buildUrl(city) {
      const params = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        forecast_days: '2',
        timezone: 'auto'
      });
      return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    }
  },
  prayer: {
    buildUrl(city) {
      const params = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        method: city.prayerMethod,
        school: '0',
        timezonestring: city.timezone,
        adjustment: '0'
      });
      return `https://api.aladhan.com/v1/timings?${params.toString()}`;
    }
  }
};
