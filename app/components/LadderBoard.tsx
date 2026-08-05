"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { selectRandom } from "../lib/assignment";

export type LadderItem = { id: string; label: string };
type Rung = { top: number; column: number };

type LadderBoardProps = {
  candidates: LadderItem[];
  onComplete: (winner: LadderItem) => void;
  buttonLabel?: string;
  durationMs?: number;
};

export function LadderBoard({ candidates, onComplete, buttonLabel = "사다리 타기", durationMs = 2400 }: LadderBoardProps) {
  const [running, setRunning] = useState(false);
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [winner, setWinner] = useState<LadderItem | null>(null);
  const timerRef = useRef<number | null>(null);
  const columns = Math.max(2, Math.min(6, candidates.length || 2));

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const climb = () => {
    if (running || !candidates.length) return;
    const nextRungs = Array.from({ length: 8 }, (_, index) => ({ top: 12 + index * 10, column: Math.floor(Math.random() * Math.max(1, columns - 1)) }));
    const selected = selectRandom(candidates);
    if (!selected) return;
    setRungs(nextRungs);
    setWinner(null);
    setRunning(true);
    timerRef.current = window.setTimeout(() => {
      setWinner(selected);
      setRunning(false);
      onComplete(selected);
    }, durationMs);
  };

  return (
    <div className="ladder-card">
      <div className={`ladder-board${running ? " is-climbing" : ""}`} style={{ "--ladder-columns": columns } as CSSProperties} aria-live="assertive">
        <div className="ladder-names">{candidates.slice(0, columns).map((candidate) => <span key={candidate.id}>{candidate.label}</span>)}</div>
        <div className="ladder-lines">
          {Array.from({ length: columns }, (_, index) => <i className="ladder-line" style={{ left: `${(index * 100) / (columns - 1)}%` }} key={index} />)}
          {rungs.map((rung, index) => <b className="ladder-rung" style={{ top: `${rung.top}%`, left: `${(rung.column * 100) / (columns - 1)}%`, width: `${100 / (columns - 1)}%` }} key={index} />)}
          {running && <em className="ladder-climber" />}
        </div>
        <div className="ladder-results">{candidates.slice(0, columns).map((candidate) => <span className={winner?.id === candidate.id ? "is-winner" : ""} key={candidate.id}>{winner?.id === candidate.id ? "당첨" : "도착"}</span>)}</div>
      </div>
      <div className="ladder-meta">{running ? "선이 만나는 곳마다 방향이 바뀝니다..." : winner ? `🎉 사다리 끝에서 ${winner.label}님이 당첨!` : `${candidates.length}명 · 출발선을 골라보세요`}</div>
      <button className="primary-button" type="button" disabled={running || !candidates.length} onClick={climb}>{running ? "사다리 내려가는 중..." : buttonLabel} <span>↘</span></button>
    </div>
  );
}
