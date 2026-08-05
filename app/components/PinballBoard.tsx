"use client";

import { useEffect, useRef, useState } from "react";
import { firstArrival } from "../lib/assignment";

export type PinballItem = { id: string; label: string };
type Racer = PinballItem & { arrival: number; lane: number };

type PinballBoardProps = {
  candidates: PinballItem[];
  onComplete: (winner: PinballItem) => void;
  buttonLabel?: string;
  durationMs?: number;
};

export function PinballBoard({ candidates, onComplete, buttonLabel = "공 발사", durationMs = 2400 }: PinballBoardProps) {
  const [racing, setRacing] = useState(false);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [display, setDisplay] = useState("READY");
  const [winner, setWinner] = useState<PinballItem | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const launch = () => {
    if (racing || !candidates.length) return;
    const race = candidates.map((candidate, index) => ({
      ...candidate,
      arrival: 650 + Math.floor(Math.random() * Math.max(500, durationMs - 500)),
      lane: index % 5,
    }));
    const first = firstArrival(race);
    if (!first) return;
    setRacers(race);
    setWinner(null);
    setDisplay("RACE!");
    setRacing(true);
    const settleAt = Math.max(...race.map((racer) => racer.arrival)) + 250;
    timerRef.current = window.setTimeout(() => {
      setWinner(first);
      setDisplay(first.label);
      setRacing(false);
      onComplete(first);
    }, settleAt);
  };

  return (
    <div className="pinball-card">
      <div className={`pinball-board${racing ? " is-racing" : ""}`} aria-live="assertive">
        <div className="pinball-lights" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="pinball-rail rail-one" aria-hidden="true" />
        <div className="pinball-rail rail-two" aria-hidden="true" />
        <div className="pinball-bumper bumper-one" aria-hidden="true">1</div>
        <div className="pinball-bumper bumper-two" aria-hidden="true">2</div>
        <div className="pinball-bumper bumper-three" aria-hidden="true">3</div>
        {racers.map((racer) => <div className={`pinball-ball pinball-racer lane-${racer.lane}`} key={racer.id} style={{ animationDelay: `${racer.arrival - durationMs}ms`, animationDuration: `${durationMs}ms` }}>{racer.label}</div>)}
        {!racers.length && <div className="pinball-ball">{display}</div>}
        <div className="pinball-slots" aria-label="결과 슬롯">
          {candidates.slice(0, 5).map((candidate) => <span className={winner?.id === candidate.id ? "is-winner" : ""} key={candidate.id}>{candidate.label}</span>)}
        </div>
      </div>
      <div className="pinball-meta">{racing ? "전원 동시 출발! 가장 먼저 구멍에 들어간 공이 당첨입니다." : winner ? `🏆 ${winner.label} 공이 제일 먼저 골인했습니다!` : `${candidates.length}명 동시 출발 · 가장 빠른 공을 지켜보세요`}</div>
      <button className="primary-button" type="button" disabled={racing || !candidates.length} onClick={launch}>{racing ? "골인 판정 중..." : buttonLabel} <span>↗</span></button>
    </div>
  );
}
