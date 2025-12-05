import React, { useState, useRef } from "react";
import { Howl } from "howler";

const sounds = [
  { name: "Lluvia", src: "/sounds/rain-on-window.mp3" },
  { name: "Viento", src: "/sounds/wind.mp3" },
  { name: "Café", src: "/sounds/cafe.mp3" },
  { name: "Fuego", src: "/sounds/campfire.mp3" },
  { name: "Teclado", src: "/sounds/keyboard.mp3" },
];

export default function AmbientSounds() {
  const soundRefs = useRef<{ [key: string]: Howl }>({});
  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({});
  const [volumes, setVolumes] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    sounds.forEach(s => { initial[s.name] = 0; });
    return initial;
  });

  const toggleSound = (name: string, src: string) => {
    if (!soundRefs.current[name]) {
      soundRefs.current[name] = new Howl({ src: [src], loop: true, volume: 0 });
    }
    const sound = soundRefs.current[name];
    if (playing[name]) {
      sound.pause();
      setVolumes((prev) => ({ ...prev, [name]: 0 }));
      sound.volume(0);
    } else {
      // Use the current slider value (or default 5) for volume, mapped to 0-0.15
      const initialVol = volumes[name] ?? 5;
      sound.volume(initialVol / 15 * 0.15);
      sound.play();
      setVolumes((prev) => ({ ...prev, [name]: initialVol }));
    }
    setPlaying((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const setVolume = (name: string, value: number) => {
    setVolumes((prev) => ({ ...prev, [name]: value }));
    if (soundRefs.current[name]) {
      soundRefs.current[name].volume(value / 15 * 0.15);
    }
  };

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
      gap: 16,
      position: 'relative',
    }}>
      <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, background: 'linear-gradient(90deg,#00c6ff,#0072ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 12px #00c6ff44', letterSpacing: 1 }}>
        🌿 Sonidos Ambientales
      </div>
      {sounds.map(sound => (
        <div key={sound.name} style={{ width: '100%', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => toggleSound(sound.name, sound.src)}
            style={{
              borderRadius: '50%',
              background: playing[sound.name] ? 'linear-gradient(135deg,#00c6ff,#0072ff)' : 'rgba(30,30,40,0.55)',
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
              transition: 'background 0.2s',
            }}
          >{playing[sound.name] ? '⏸' : '▶'}</button>
          <span style={{ flex: 1 }}>{sound.name}</span>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={volumes[sound.name] ?? 0}
            onChange={e => setVolume(sound.name, Number(e.target.value))}
            onWheel={e => {
              e.preventDefault();
              // Big jumps with wheel (3 per scroll)
              const delta = Math.sign(e.deltaY) * -3;
              let newValue = (volumes[sound.name] ?? 0) + delta;
              newValue = Math.max(0, Math.min(15, newValue));
              setVolume(sound.name, newValue);
            }}
            style={{
              width: 80,
              accentColor: '#00c6ff',
              background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
              borderRadius: 8,
              height: 6,
              outline: 'none',
              boxShadow: '0 1px 6px #00c6ff44',
              marginLeft: 8,
              verticalAlign: 'middle',
              cursor: 'pointer',
              border: 'none',
              appearance: 'none',
            }}
          />
          <span style={{ minWidth: 36, textAlign: 'right', color: '#00c6ff', fontWeight: 'bold', fontSize: 14 }}>
            {Math.round((volumes[sound.name] ?? 0) / 15 * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
