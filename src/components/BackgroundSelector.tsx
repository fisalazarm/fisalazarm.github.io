import React, { useState } from "react";

// Solo GIFs, puedes ir agregando más en el array backgrounds
const backgrounds = [
  { type: "image", src: "/pixeljeff.gif", name: "Pixel Jeff - Rainy" },
  { type: "image", src: "/pixel-jeff-stay.gif", name: "Pixel Jeff - Window" },
  { type: "image", src: "/pixel-jeff-sunday-mood.gif", name: "Pixel Jeff - Sunday Mood" },
];

interface BackgroundSelectorProps {
  onSelect: (background: { type: "image" | "gradient" | "video"; src: string }) => void;
  selected: { type: "image" | "gradient" | "video"; src: string };
}

export default function BackgroundSelector({ onSelect, selected }: BackgroundSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minWidth: 80, position: 'relative' }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          background: 'rgba(30,30,40,0.75)',
          borderRadius: 24,
          padding: 18,
          border: "1.5px solid #00c6ff",
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          minWidth: 220,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <img
          src={selected?.src || backgrounds[0].src}
          alt="Fondo seleccionado"
          style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
        />
        <span style={{ color: "#fff", marginLeft: 10, fontWeight: "bold" }}>
          {backgrounds.find(bg => bg.src === (selected?.src || backgrounds[0].src))?.name || ""}
        </span>
        <span style={{ color: "#fff", marginLeft: 10, fontWeight: "bold" }}>▼</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 60,
            background: 'rgba(30,30,40,0.92)',
            borderRadius: 24,
            padding: 18,
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 220,
            border: "1.5px solid #00c6ff",
          }}
        >
          {backgrounds.map((bg, idx) => (
            <button
              key={bg.src}
              onClick={() => {
                onSelect({ type: bg.type as "image" | "gradient" | "video", src: bg.src });
                setOpen(false);
              }}
              style={{
                border: selected?.src === bg.src ? "2px solid #00c6ff" : "1px solid #333",
                borderRadius: 10,
                padding: 0,
                background: selected?.src === bg.src ? 'linear-gradient(90deg,#00c6ff,#0072ff)' : 'rgba(40,40,50,0.7)',
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
                boxShadow: selected?.src === bg.src ? '0 2px 12px #00c6ff88' : 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              <img
                src={bg.src}
                alt={bg.name}
                style={{ width: 64, height: 64, borderRadius: 6, objectFit: "cover" }}
              />
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{bg.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
