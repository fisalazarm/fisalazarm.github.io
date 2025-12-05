import React, { useState, useRef } from "react";

const WORK_TIME = 25 * 60; // 25 minutos en segundos
const BREAK_TIME = 5 * 60; // 5 minutos en segundos

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [time, setTime] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (!isRunning || time === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, time]);

  React.useEffect(() => {
    if (time === 0) {
      if (mode === 'work') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        setTimeout(() => {
          setMode('break');
          setTime(BREAK_TIME);
          setIsRunning(false);
        }, 1000);
      } else if (mode === 'break') {
        if (breakAudioRef.current) {
          breakAudioRef.current.currentTime = 0;
          breakAudioRef.current.play();
        }
        setTimeout(() => {
          setMode('work');
          setTime(WORK_TIME);
          setIsRunning(false);
        }, 1000);
      }
    }
  }, [time, mode]);

  const handleStart = () => {
    setIsRunning(true);
    if (startAudioRef.current) {
      startAudioRef.current.currentTime = 0;
      startAudioRef.current.play();
    }
  };
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setTime(WORK_TIME);
  };

  // Barra de progreso circular
  const total = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const percent = (time / total) * 100;
  const radius = 100;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{
      background: 'rgba(30,30,40,0.75)',
      borderRadius: 24,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1.5px solid #00c6ff',
      color: '#fff',
      textAlign: 'center',
      padding: 32,
      minWidth: 260,
      maxWidth: 340,
      margin: '0 auto',
      position: 'relative',
    }}>
      <h2 style={{ fontWeight: 'bold', fontSize: 28, letterSpacing: 1, marginBottom: 12, color: mode === 'work' ? '#00c6ff' : '#ff9800', textShadow: '0 2px 8px #0008' }}>
        {mode === 'work' ? 'Pomodoro' : 'Descanso'}
      </h2>
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 18px auto' }}>
        <svg width={220} height={220}>
          <circle
            stroke="#222a"
            fill="none"
            cx={110}
            cy={110}
            r={normalizedRadius}
            strokeWidth={stroke}
          />
          <circle
            stroke={mode === 'work' ? '#00c6ff' : '#ff9800'}
            fill="none"
            cx={110}
            cy={110}
            r={normalizedRadius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 56, fontWeight: 'bold', letterSpacing: 2, color: '#fff', textShadow: '0 2px 8px #0008', animation: 'pulse 1s infinite alternate' }}>{formatTime(time)}</span>
          <span style={{ fontSize: 18, color: '#ccc', marginTop: 4 }}>{mode === 'work' ? 'Trabajo' : 'Break'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
        <button className="btn pomodoro-btn" onClick={handleStart} disabled={isRunning || time === 0} style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: isRunning || time === 0 ? '#4caf5088' : 'linear-gradient(135deg,#00c6ff,#0072ff)',
          color: '#fff',
          fontSize: 22,
          border: 'none',
          boxShadow: '0 2px 12px #00c6ff44',
          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          opacity: isRunning || time === 0 ? 0.6 : 1,
          cursor: isRunning || time === 0 ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}>▶</button>
        <button className="btn pomodoro-btn" onClick={handlePause} disabled={!isRunning} style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: !isRunning ? '#ff980088' : 'linear-gradient(135deg,#ff9800,#ffc107)',
          color: '#fff',
          fontSize: 22,
          border: 'none',
          boxShadow: '0 2px 12px #ff980044',
          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          opacity: !isRunning ? 0.6 : 1,
          cursor: !isRunning ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}>❚❚</button>
        <button className="btn pomodoro-btn" onClick={handleReset} style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#f44336,#e57373)',
          color: '#fff',
          fontSize: 22,
          border: 'none',
          boxShadow: '0 2px 12px #f4433644',
          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}>⟳</button>
      </div>
      <audio ref={audioRef} src="/alarma.wav" preload="auto" />
      <audio ref={startAudioRef} src="/start.wav" preload="auto" />
      {time === 0 && (
        <div style={{ marginTop: 18, fontWeight: 'bold', color: mode === 'work' ? '#00c6ff' : '#ff9800', fontSize: 18, textShadow: '0 2px 8px #0008', letterSpacing: 1 }}>
          {mode === 'work' ? '¡Tiempo de descanso!' : '¡Descanso terminado!'}
        </div>
      )}
      <audio ref={audioRef} src="/alarma.wav" preload="auto" />
      <audio ref={startAudioRef} src="/start.wav" preload="auto" />
      <audio ref={breakAudioRef} src="/break.wav" preload="auto" />
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}