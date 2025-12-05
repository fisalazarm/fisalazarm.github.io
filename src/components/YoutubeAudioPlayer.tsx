import React from "react";
import YouTube from "react-youtube";

export default function YoutubeAudioPlayer({ videoId = "5qap5aO4i9A" }) {
  // Ejemplo: videoId = "5qap5aO4i9A" (Lofi Girl)
  const opts = {
    height: "1", // Oculta el video
    width: "200",
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 100, zIndex: 1000, background: "rgba(0,0,0,0.7)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#fff", fontWeight: "bold" }}>YouTube Audio:</span>
      <YouTube videoId={videoId} opts={opts} />
    </div>
  );
}
