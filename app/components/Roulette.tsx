"use client";

import { useEffect, useRef, useState } from "react";
import { selectRandom } from "../lib/assignment";

export type RouletteItem = { id: string; label: string };

type RouletteProps = {
  candidates: RouletteItem[];
  onComplete: (winner: RouletteItem) => void;
  buttonLabel?: string;
  countdownSeconds?: number;
  mood?: "standard" | "survival";
};

export function Roulette({ candidates, onComplete, buttonLabel = "추첨 시작", countdownSeconds = 0, mood = "standard" }: RouletteProps) {
  const [display, setDisplay] = useState("READY");
  const [spinning, setSpinning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
  }, []);

  const spin = () => {
    if (spinning || candidates.length === 0) return;
    setSpinning(true);
    setCountdown(countdownSeconds);
    let tick = 0;
    intervalRef.current = window.setInterval(() => {
      setDisplay(candidates[tick % candidates.length].label);
      tick += 1;
    }, 80);
    if (countdownSeconds > 0) {
      countdownRef.current = window.setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    }
    const duration = countdownSeconds > 0 ? countdownSeconds * 1000 : 1200;
    timerRef.current = window.setTimeout(() => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      const winner = selectRandom(candidates);
      if (winner) { setDisplay(winner.label); onComplete(winner); }
      setCountdown(0);
      setSpinning(false);
    }, duration);
  };

  return (
    <div className="roulette-card">
      <div className={`roulette-display${spinning ? " is-spinning" : ""}`} aria-live="assertive">{display}</div>
      <div className="roulette-meta">{spinning && countdown > 0 ? `폭탄 해제까지 ${countdown}초` : mood === "survival" ? `생존자 ${candidates.length}명 · 마지막까지 버티세요` : `${candidates.length}명 후보`}</div>
      <button className="primary-button" type="button" disabled={spinning || candidates.length === 0} onClick={spin}>{spinning ? (countdown > 0 ? `${countdown}초 남음` : "결과 확인 중") : buttonLabel} <span>→</span></button>
    </div>
  );
}
