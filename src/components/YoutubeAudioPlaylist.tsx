import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";


export default function YoutubeAudioPlaylist() {
  // Autoplay al cargar la página
  useEffect(() => {
    const player = playerRef.current?.getInternalPlayer?.() || playerRef.current?.internalPlayer;
    if (player && typeof player.playVideo === 'function' && autoplay) {
      player.playVideo();
      setPlaying(true);
    }
  }, []);

  const [volume, setVolume] = useState(15);



const defaultPlaylist = [
  { id: "5qap5aO4i9A", title: "Lofi Girl" },
  { id: "DWcJFNfaw9c", title: "Chillhop Radio" },
  { id: "hHW1oY26kxQ", title: "Lofi Hip Hop" },
];

  const [playlist, setPlaylist] = useState(defaultPlaylist);

  const [autoplay, setAutoplay] = useState(true);
  useEffect(() => {
    fetch("/playlist.json")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlaylist(data);
      });
  }, []);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [playing, setPlaying] = useState(true);
  const playerRef = React.useRef<YouTube>(null);

  // Set volume to 20% when player is ready or video changes
  const setPlayerVolume = (vol: number) => {
    const player = playerRef.current?.getInternalPlayer?.() || playerRef.current?.internalPlayer;
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(vol);
    }
  };

  const handleReady = () => {
    setPlayerVolume(volume);
    // Forzar autoplay al cargar el componente
    const player = playerRef.current?.getInternalPlayer?.() || playerRef.current?.internalPlayer;
    if (player && typeof player.playVideo === 'function' && autoplay) {
      player.playVideo();
      setPlaying(true);
    }
  };

  useEffect(() => {
    setPlayerVolume(volume);
    // Forzar autoplay al cambiar de canción
    const player = playerRef.current?.getInternalPlayer?.() || playerRef.current?.internalPlayer;
    if (player && typeof player.playVideo === 'function' && autoplay) {
      player.playVideo();
      setPlaying(true);
    }
  }, [volume, current, autoplay]);

  // Removed unnecessary useEffect that sets autoplay to false

  const opts = {
    height: "40",
    width: "200",
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const handleEnd = () => {
    setCurrent((prev) => (prev + 1) % playlist.length);
    setAutoplay(true);
    setPlaying(true);
  };

  const handlePlay = () => {
    setPlaying(true);
    setAutoplay(true);
    const player = playerRef.current?.getInternalPlayer?.() || playerRef.current?.internalPlayer;
    if (player && typeof player.playVideo === 'function') {
      player.playVideo();
      setTimeout(() => setPlayerVolume(volume), 300);
    }
  };

  const handlePause = () => {
    setPlaying(false);
    if (playerRef.current) playerRef.current.internalPlayer.pauseVideo();
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + playlist.length) % playlist.length);
    setAutoplay(true);
    setPlaying(true);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % playlist.length);
    setAutoplay(true);
    setPlaying(true);
  };

  const handleAdd = () => {
    const match = input.match(/(?:v=|youtu.be\/)([\w-]{11})/);
    if (match) {
      setPlaylist([...playlist, { id: match[1], title: `Video ${playlist.length + 1}` }]);
      setInput("");
    }
  };

  return (
    <div style={{
      position: "static",
      background: 'rgba(30,30,40,0.55)',
      borderRadius: 24,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.18)',
      minWidth: 240,
      padding: 18,
      maxWidth: 340,
    }}>
      <div style={{
        fontWeight: 'bold',
        fontSize: 22,
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 4,
        padding: '8px 0 4px 0',
        background: 'linear-gradient(90deg,#00c6ff,#0072ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 12px #00c6ff44',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        textAlign: 'center',
      }}>🎵 YouTube Playlist</div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
        <div style={{ width: 220, height: 124, overflow: 'hidden', borderRadius: 12, boxShadow: '0 2px 12px #00c6ff22', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222a' }}>
          <YouTube
            videoId={playlist[current].id}
            opts={{ ...opts, height: "124", width: "220", playerVars: { ...opts.playerVars, controls: 1 } }}
            onEnd={handleEnd}
            onReady={handleReady}
            ref={playerRef}
            style={{ margin: '0 auto', display: 'block', width: '100%', height: '100%', opacity: 1, pointerEvents: 'auto', borderRadius: 12 }}
          />
        </div>
      </div>
      <div style={{ color: "#fff", fontSize: 13, marginBottom: 8 }}>
        <label htmlFor="volume-slider" style={{ marginRight: 12 }}><b>Volumen:</b></label>
        <input
          id="volume-slider"
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          onWheel={e => {
            e.preventDefault();
            const delta = Math.sign(e.deltaY) * -1; // rueda arriba: +1, abajo: -1
            setVolume(v => Math.max(0, Math.min(100, v + delta)));
          }}
          style={{
            width: 120,
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
        <span style={{ marginLeft: 12, fontWeight: 'bold', color: '#00c6ff', fontSize: 15 }}>{volume}%</span>
      </div>
      {/* Move the style block outside the JSX */}
      <style>{`
        input[type=range]#volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00c6ff;
          box-shadow: 0 2px 8px #00c6ff88;
          border: 2px solid #fff;
          transition: background 0.3s;
        }
        input[type=range]#volume-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00c6ff;
          box-shadow: 0 2px 8px #00c6ff88;
          border: 2px solid #fff;
          transition: background 0.3s;
        }
        input[type=range]#volume-slider::-ms-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00c6ff;
          box-shadow: 0 2px 8px #00c6ff88;
          border: 2px solid #fff;
          transition: background 0.3s;
        }
      `}</style>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button
          onClick={handlePrev}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
            color: '#fff',
            fontSize: 22,
            border: 'none',
            boxShadow: '0 2px 12px #00c6ff44',
            transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >⏮</button>
        {playing ? (
          <button
            onClick={handlePause}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#ff9800,#ffc107)',
              color: '#fff',
              fontSize: 22,
              border: 'none',
              boxShadow: '0 2px 12px #ff980044',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >⏸</button>
        ) : (
          <button
            onClick={handlePlay}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
              color: '#fff',
              fontSize: 22,
              border: 'none',
              boxShadow: '0 2px 12px #00c6ff44',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >▶</button>
        )}
        <button
          onClick={handleNext}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
            color: '#fff',
            fontSize: 22,
            border: 'none',
            boxShadow: '0 2px 12px #00c6ff44',
            transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >⏭</button>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pega el link de YouTube"
          style={{
            width: '70%',
            borderRadius: 12,
            border: '1.5px solid #00c6ff',
            padding: '8px 12px',
            background: 'rgba(30,30,40,0.55)',
            color: '#fff',
            fontSize: 16,
            boxShadow: '0 2px 12px #00c6ff22',
            outline: 'none',
            fontWeight: 'bold',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#00c6ff,#0072ff)',
            color: '#fff',
            fontSize: 24,
            border: 'none',
            boxShadow: '0 2px 12px #00c6ff44',
            transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >+</button>
      </div>
      <ul style={{ color: "#fff", marginTop: 8, fontSize: 14, paddingLeft: 16 }}>
        {playlist.map((vid, idx) => (
          <li key={vid.id} style={{ fontWeight: idx === current ? "bold" : "normal" }}>
            {vid.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
