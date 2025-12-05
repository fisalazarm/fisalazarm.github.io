"use client";

import { useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import PomodoroTimer from "../components/PomodoroTimer";
import BackgroundSelector from "../components/BackgroundSelector";
import YoutubeAudioPlaylist from "../components/YoutubeAudioPlaylist";
import React, { Suspense } from "react";
import AmbientSounds from "../components/AmbientSounds";

const WeatherWidget = React.lazy(() => import("../components/WeatherWidget"));

export default function Home() {
  const [background, setBackground] = useState<{ type: "image" | "gradient" | "video"; src: string }>({ type: "image", src: "/pixeljeff.gif" });
  const [expandedWeather, setExpandedWeather] = useState(true);
  const [expandedAmbient, setExpandedAmbient] = useState(true);
  const [expandedYoutube, setExpandedYoutube] = useState(true);
  const [expandedBackground, setExpandedBackground] = useState(false);

  return (
    <>
      <AnimatedBackground
        type={background.type}
        imageSrc={background.type === "image" ? background.src : undefined}
        videoSrc={background.type === "video" ? background.src : undefined}
      />
      <div style={{ position: 'fixed', top: 32, left: 32, zIndex: 3000 }}>
        <div style={{ background: 'rgba(30,30,40,0.75)', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', backdropFilter: 'blur(12px)', border: '1.5px solid #00c6ff', padding: 12 }}>
          <button onClick={() => setExpandedWeather(!expandedWeather)} style={{ background: 'none', border: 'none', color: '#00c6ff', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            {expandedWeather ? '▼' : '▶'} Clima
          </button>
          {expandedWeather && (
            <Suspense fallback={<div>Loading weather...</div>}>
              <WeatherWidget />
            </Suspense>
          )}
        </div>
      </div>

      <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 3000 }}>
        <div style={{ background: 'rgba(30,30,40,0.75)', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', backdropFilter: 'blur(12px)', border: '1.5px solid #00c6ff', padding: 12 }}>
          <button onClick={() => setExpandedAmbient(!expandedAmbient)} style={{ background: 'none', border: 'none', color: '#00c6ff', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', width: '100%', textAlign: 'left', marginBottom: 8 }}>
            {expandedAmbient ? '▼' : '▶'} Sonidos
          </button>
          {expandedAmbient && <AmbientSounds />}
        </div>
      </div>

      <div style={{ position: 'fixed', right: 32, top: 320, zIndex: 2500 }}>
        <div style={{ background: 'rgba(30,30,40,0.75)', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', backdropFilter: 'blur(12px)', border: '1.5px solid #00c6ff', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={() => setExpandedYoutube(!expandedYoutube)} style={{ background: 'none', border: 'none', color: '#00c6ff', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', marginBottom: expandedYoutube ? 12 : 0 }}>
            {expandedYoutube ? '▼' : '▶'} YouTube
          </button>
          {expandedYoutube && <YoutubeAudioPlaylist />}
        </div>
      </div>

      {/* Selector de fondo en la esquina inferior izquierda, con mayor separación y zIndex */}
      <div style={{ position: "fixed", left: 32, bottom: 32, zIndex: 2500 }}>
        <div style={{ background: 'rgba(30,30,40,0.75)', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', backdropFilter: 'blur(12px)', border: '1.5px solid #00c6ff', padding: 12 }}>
          <button onClick={() => setExpandedBackground(!expandedBackground)} style={{ background: 'none', border: 'none', color: '#00c6ff', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', width: '100%', textAlign: 'left', marginBottom: 8 }}>
            {expandedBackground ? '▼' : '▶'} Fondo
          </button>
          {expandedBackground && <BackgroundSelector onSelect={setBackground} selected={background} />}
        </div>
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1, marginTop: 64 }}>
        <div className="row mb-4">
          <div className="col text-center">
            <h1 style={{
              fontWeight: 'bold',
              fontSize: 56,
              letterSpacing: 2,
              marginBottom: 8,
              background: 'linear-gradient(90deg,#00c6ff,#0072ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 24px #00c6ff44',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              textAlign: 'center',
            }}>🌙 ChillSpace</h1>
            <p
              className=""
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                letterSpacing: 1,
                marginBottom: 4,
                background: 'linear-gradient(90deg,#ff9800,#ffc107)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 12px #ff980044',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                textAlign: 'center',
              }}
            >Pomodoro app to help you focus and relax.</p>
          </div>
          <br />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* <YoutubeAudioPlaylist /> */}
        </div>
        <div className="row align-items-center" style={{ position: 'relative', zIndex: 2 }}>
          <div className="col-12 col-md-7 d-flex justify-content-center mb-4 mb-md-0">
            <PomodoroTimer />
          </div>
          <div className="col-12 col-md-5 d-flex flex-column align-items-center">
          </div>
        </div>
      </div>
    </>
  );
}
