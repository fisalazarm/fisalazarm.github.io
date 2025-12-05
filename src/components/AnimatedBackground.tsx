import React from "react";
import styles from "./AnimatedBackground.module.css";

type Props = {
  type?: "gradient" | "video" | "image";
  videoSrc?: string;
  imageSrc?: string;
};

export default function AnimatedBackground({ type = "gradient", videoSrc, imageSrc }: Props) {
  if (type === "video" && videoSrc) {
    return (
      <video
        className={styles.background}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{ objectFit: "cover", width: "100vw", height: "100vh" }}
      />
    );
  }
  if (type === "image" && imageSrc) {
    return (
      <img
        className={styles.background}
        src={imageSrc}
        alt="background"
        style={{ objectFit: "cover", width: "100vw", height: "100vh" }}
      />
    );
  }
  return <div className={styles.background + " " + styles[type]} />;
}
