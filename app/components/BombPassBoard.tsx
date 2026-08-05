"use client";

import { useEffect, useRef, useState } from "react";

export type BombItem = { id: string; label: string };

type BombPassBoardProps = {
  candidates: BombItem[];
  onComplete: (winner: BombItem) => void;
  buttonLabel?: string;
  durationMs?: number;
};

export function BombPassBoard({ candidates, onComplete, buttonLabel = "폭탄 돌리기", durationMs = 5000 }: BombPassBoardProps) {
  const [running, setRunning] = useState(false);
  const [holderIndex, setHolderIndex] = useState(0);
  const [winner, setWinner] = useState<BombItem | null>(null);
  const passRef = useRef<number | null>(null);
  const stopRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (passRef.current) window.clearInterval(passRef.current);
    if (stopRef.current) window.clearTimeout(stopRef.current);
  }, []);

  const start = () => {
    if (running || !candidates.length) return;
    const initial = Math.floor(Math.random() * candidates.length);
    setHolderIndex(initial);
    setWinner(null);
    setRunning(true);
    passRef.current = window.setInterval(() => setHolderIndex((current) => (current + 1) % candidates.length), 160);
    stopRef.current = window.setTimeout(() => {
      if (passRef.current) window.clearInterval(passRef.current);
      setHolderIndex((current) => {
        const selected = candidates[current];
        setWinner(selected);
        setRunning(false);
        onComplete(selected);
        return current;
      });
    }, durationMs);
  };

  return (
    <div className="bomb-card">
      <div className={`bomb-arena${running ? " is-active" : ""}`} aria-live="assertive">
        <div className="bomb-warning">{running ? "DANGER · 폭탄 이동 중" : winner ? "BOOM · 결과 확정" : "PASS THE BOMB"}</div>
        <div className="bomb-core">{running ? "💣" : winner ? "💥" : "💣"}<small>{running ? "잡지 마세요" : winner ? winner.label : "START"}</small></div>
        <div className="bomb-participants">
          {candidates.map((candidate, index) => <span className={index === holderIndex ? "is-holder" : ""} key={candidate.id}><i>{index + 1}</i>{candidate.label}</span>)}
        </div>
      </div>
      <div className="bomb-meta">{running ? "폭탄이 멈추는 순간 들고 있던 사람이 당첨됩니다!" : winner ? `💥 ${winner.label}님에게 폭탄이 멈췄습니다!` : `${candidates.length}명 참가 · 카운트다운 후 폭탄이 멈춥니다`}</div>
      <button className="primary-button" type="button" disabled={running || !candidates.length} onClick={start}>{running ? "폭탄 이동 중..." : buttonLabel} <span>!</span></button>
    </div>
  );
}
