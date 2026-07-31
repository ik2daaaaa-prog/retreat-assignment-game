"use client";

import { useEffect } from "react";

export default function RaceSpeedTuner() {
  useEffect(() => {
    const original = window.requestAnimationFrame.bind(window);
    const scale = 1.1;
    window.requestAnimationFrame = (callback) => {
      let firstReal = 0;
      let firstScaled = 0;
      return original((time) => {
        if (!firstReal) { firstReal = time; firstScaled = time; }
        callback(firstScaled + (time - firstReal) * scale);
      });
    };
    return () => { window.requestAnimationFrame = original; };
  }, []);
  return null;
}
