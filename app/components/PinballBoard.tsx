"use client";

import { useEffect, useRef, useState } from "react";
import { selectRandom } from "../lib/assignment";

export type PinballItem = { id: string; label: string };

type PinballBoardProps = {
  candidates: PinballItem[];
  onComplete: (winner: PinballItem) => void;
  buttonLabel?: string;
  durationMs?: number;
};

export function PinballBoard({ candidates, onComplete, buttonLabel = "공 발사", durationMs = 2400 }: PinballBoardProps) {
  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState("READY");
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const launch = () => {
    if (spinning || !candidates.length) return;
    setSpinning(true);
    setDisplay("⚡");
    timerRef.current = window.setTimeout(() => {
      const winner = selectRandom(candidates);
      if (winner) { setDisplay(winner.label); onComplete(winner); }
      setSpinning(false);
    }, durationMs);
  };

  return (
    <div className="pinball-card">
      <div className={`pinball-board${spinning ? " is-running" : ""}`} aria-live="assertive">
        <div className="pinball-lights" aria-hidden="true"><i /><i /><i /></div>
        <div className="pinball-rail rail-one" aria-hidden="true" />
        <div className="pinball-rail rail-two" aria-hidden="true" />
        <div className="pinball-bumper bumper-one" aria-hidden="true">1</div>
        <div className="pinball-bumper bumper-two" aria-hidden="true">2</div>
        <div className="pinball-bumper bumper-three" aria-hidden="true">3</div>
        <div className="pinball-ball">{display}</div>
        <div className="pinball-slots" aria-label="결과 슬롯">
          {candidates.slice(0, 5).map((candidate) => <span key={candidate.id}>{candidate.label}</span>)}
        </div>
      </div>
      <div className="pinball-meta">{spinning ? "공이 범퍼를 통과하는 중..." : `${candidates.length}명 후보 · 슬롯에 들어갈 사람은?`}</div>
      <button className="primary-button" type="button" disabled={spinning || !candidates.length} onClick={launch}>{spinning ? "판정 중..." : buttonLabel} <span>↗</span></button>
    </div>
  );
}
