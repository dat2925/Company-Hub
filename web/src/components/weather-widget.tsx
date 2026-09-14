'use client';
import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Loader2 } from 'lucide-react';

interface WeatherData {
  temperature: number;
  weathercode: number;
  location: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default to Hanoi if geolocation fails or is denied
    const defaultLat = 21.0285;
    const defaultLon = 105.8542;

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const [weatherRes, locRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`)
        ]);
        
        const data = await weatherRes.json();
        const locData = await locRes.json();
        const locationName = locData.city || locData.locality || locData.principalSubdivision || 'Hà Nội';

        if (data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
            location: locationName
          });
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      } finally {
        setLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeather(defaultLat, defaultLon);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(defaultLat, defaultLon);
    }
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 border border-slate-200/80 text-slate-400 text-[10px] font-bold tracking-wide shadow-xs">
        <Loader2 size={12} className="animate-spin" />
        <span>Weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0 || code === 1) return <Sun size={12} className="text-amber-500" />;
    if (code === 2 || code === 3) return <Cloud size={12} className="text-slate-400" />;
    if (code === 45 || code === 48) return <CloudFog size={12} className="text-slate-400" />;
    if (code >= 51 && code <= 67) return <CloudRain size={12} className="text-blue-500" />;
    if (code >= 71 && code <= 77) return <Snowflake size={12} className="text-sky-300" />;
    if (code >= 80 && code <= 82) return <CloudRain size={12} className="text-blue-600" />;
    if (code >= 85 && code <= 86) return <Snowflake size={12} className="text-sky-400" />;
    if (code >= 95) return <CloudLightning size={12} className="text-purple-500" />;
    return <Cloud size={12} className="text-slate-400" />;
  };

  return (
    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 border border-slate-200/80 text-slate-700 text-[10px] font-bold tracking-wide shadow-xs">
      {getWeatherIcon(weather.weathercode)}
      <span>{weather.temperature}°C</span>
      <span className="text-slate-400 font-medium border-l border-slate-200 pl-1.5 ml-0.5 max-w-[80px] truncate" title={weather.location}>{weather.location}</span>
    </div>
  );
}
