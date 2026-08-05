"use client";

import { useEffect, useRef, useState } from "react";
import { selectRandom } from "../lib/assignment";

export type RouletteItem = { id: string; label: string };

type RouletteProps = {
  candidates: RouletteItem[];
  onComplete: (winner: RouletteItem) => void;
  buttonLabel?: string;
};

export function Roulette({ candidates, onComplete, buttonLabel = "추첨 시작" }: RouletteProps) {
  const [display, setDisplay] = useState("READY");
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const spin = () => {
    if (spinning || candidates.length === 0) return;
    setSpinning(true);
    let tick = 0;
    const interval = window.setInterval(() => {
      setDisplay(candidates[tick % candidates.length].label);
      tick += 1;
    }, 80);
    timerRef.current = window.setTimeout(() => {
      window.clearInterval(interval);
      const winner = selectRandom(candidates);
      if (winner) { setDisplay(winner.label); onComplete(winner); }
      setSpinning(false);
    }, 1200);
  };

  return (
    <div className="roulette-card">
      <div className={`roulette-display${spinning ? " is-spinning" : ""}`} aria-live="assertive">{display}</div>
      <div className="roulette-meta">{candidates.length ? `${candidates.length}명 후보` : "추첨할 후보 없음"}</div>
      <button className="primary-button" type="button" disabled={spinning || candidates.length === 0} onClick={spin}>{spinning ? "돌아가는 중…" : buttonLabel} <span>↗</span></button>
    </div>
  );
}
