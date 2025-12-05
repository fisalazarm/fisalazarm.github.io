import React, { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const DEFAULT_CITY = "Santiago";

export default function WeatherWidget() {
    const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [inputCity, setInputCity] = useState(DEFAULT_CITY);

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      });
  }, [city]);

  if (loading || !weather || weather.cod !== 200) {
    return (
      <div style={{
        background: 'rgba(30,30,40,0.75)',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid #00c6ff',
        color: '#fff',
        padding: 22,
        minWidth: 220,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
          🌦️ Clima en
        </div>
        <form onSubmit={e => { e.preventDefault(); setCity(inputCity); }} style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ position: 'relative', width: 120 }}>
            <input
              type="text"
              value={inputCity}
              onChange={async e => {
                const val = e.target.value;
                setInputCity(val);
                if (val.length > 2) {
                  const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val)}&limit=5&appid=${API_KEY}`);
                  const data = await res.json();
                  setSuggestions(data.map((item: any) => `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`));
                } else {
                  setSuggestions([]);
                }
              }}
              placeholder="Ciudad..."
              style={{
                borderRadius: 8,
                border: '1.5px solid #00c6ff',
                padding: '6px 12px',
                background: 'rgba(30,30,40,0.55)',
                color: '#fff',
                fontSize: 16,
                boxShadow: '0 2px 12px #00c6ff22',
                outline: 'none',
                fontWeight: 'bold',
                width: '100%',
              }}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul style={{
                position: 'absolute',
                background: 'rgba(30,30,40,0.98)',
                borderRadius: 8,
                boxShadow: '0 2px 12px #00c6ff44',
                margin: 0,
                padding: '4px 0',
                listStyle: 'none',
                zIndex: 100,
                top: 38,
                left: 0,
                width: '100%',
                color: '#fff',
                border: '1px solid #00c6ff',
                fontWeight: 'bold',
                fontSize: 15,
                maxHeight: 150,
                overflowY: 'auto',
              }}>
                {suggestions.map((s, i) => (
                  <li key={i} style={{ padding: '6px 12px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseDown={() => {
                      setInputCity(s);
                      setCity(s);
                      setSuggestions([]);
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#00c6ff22'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" style={{
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
            color: '#fff',
            fontSize: 18,
            border: 'none',
            boxShadow: '0 2px 12px #00c6ff44',
            cursor: 'pointer',
            width: 36,
            height: 36,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>🔍</button>
        </form>
        <div>Cargando clima...</div>
      </div>
    );
  }

  // Icono de clima de OpenWeatherMap
  const icon = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  return (
    <div style={{
      background: 'rgba(30,30,40,0.75)',
      borderRadius: 24,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1.5px solid #00c6ff',
      color: '#fff',
      padding: 22,
      minWidth: 220,
      maxWidth: 260,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      position: 'relative',
    }}>
      <form onSubmit={e => { e.preventDefault(); setCity(inputCity); }} style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ position: 'relative', width: 120 }}>
          <input
            type="text"
            value={inputCity}
            onChange={e => {
              const val = e.target.value;
              setInputCity(val);
              if (val.length > 2) {
                fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val)}&limit=5&appid=${API_KEY}`)
                  .then(res => res.json())
                  .then(data => setSuggestions(data.map((item: any) => `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`)));
              } else {
                setSuggestions([]);
              }
            }}
            placeholder="Ciudad..."
            style={{
              borderRadius: 8,
              border: '1.5px solid #00c6ff',
              padding: '6px 12px',
              background: 'rgba(30,30,40,0.55)',
              color: '#fff',
              fontSize: 16,
              boxShadow: '0 2px 12px #00c6ff22',
              outline: 'none',
              fontWeight: 'bold',
              width: '100%',
            }}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              background: 'rgba(30,30,40,0.98)',
              borderRadius: 8,
              boxShadow: '0 2px 12px #00c6ff44',
              margin: 0,
              padding: '4px 0',
              listStyle: 'none',
              zIndex: 100,
              top: 38,
              left: 0,
              width: '100%',
              color: '#fff',
              border: '1px solid #00c6ff',
              fontWeight: 'bold',
              fontSize: 15,
              maxHeight: 150,
              overflowY: 'auto',
            }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ padding: '6px 12px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseDown={() => {
                    setInputCity(s);
                    setCity(s);
                    setSuggestions([]);
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#00c6ff22'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" style={{
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
          color: '#fff',
          fontSize: 18,
          border: 'none',
          boxShadow: '0 2px 12px #00c6ff44',
          cursor: 'pointer',
          width: 36,
          height: 36,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>🔍</button>
      </form>
      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 2, background: 'linear-gradient(90deg,#00c6ff,#0072ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 12px #00c6ff44', letterSpacing: 1 }}>
        <span role="img" aria-label="weather">🌦️</span> Clima en {weather.name}
      </div>
      <img src={iconUrl} alt={weather.weather[0].description} style={{ width: 80, height: 80, marginBottom: 2, filter: 'drop-shadow(0 2px 12px #00c6ff88)' }} />
      <div style={{ fontSize: 38, fontWeight: 'bold', marginBottom: 2, background: 'linear-gradient(90deg,#00c6ff,#0072ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 12px #00c6ff44', letterSpacing: 2, animation: 'pulse 1s infinite alternate' }}>
        {Math.round(weather.main.temp)}°C
      </div>
      <div style={{ fontSize: 18, marginBottom: 2, color: '#ffc107', fontWeight: 'bold', textShadow: '0 2px 8px #ffc10744' }}>
        {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
      </div>
      <div style={{ fontSize: 15, color: '#ccc', marginBottom: 2 }}>
        Humedad: <span style={{ color: '#00c6ff', fontWeight: 'bold' }}>{weather.main.humidity}%</span> | Viento: <span style={{ color: '#00c6ff', fontWeight: 'bold' }}>{Math.round(weather.wind.speed)} km/h</span>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
