"use client";

import { useEffect, useState } from "react";

export default function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [isVisible]);

  return (
    <div
      className={`pointer-events-none fixed z-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        left: position.x,
        top: position.y,
        background:
          "radial-gradient(circle, rgba(120,119,198,0.12) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
      aria-hidden
    />
  );
}
