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
