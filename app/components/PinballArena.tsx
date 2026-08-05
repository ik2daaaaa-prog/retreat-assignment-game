"use client";

import { useEffect, useRef, useState } from "react";

export type PinballCandidate = { id: string; label: string };
type MapId = "wheel" | "bubble" | "jar";
type RaceBall = PinballCandidate & { arrival: number; lane: number; rank?: number };

const MAPS: Record<MapId, { label: string; icon: string }> = {
  wheel: { label: "운명의 수레바퀴", icon: "◉" },
  bubble: { label: "버블 바운스", icon: "○" },
  jar: { label: "욕망의 항아리", icon: "♢" },
};

type PinballArenaProps = {
  candidates: PinballCandidate[];
  onComplete: (winner: PinballCandidate) => void;
  buttonLabel?: string;
  durationMs?: number;
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function PinballArena({ candidates, onComplete, buttonLabel = "핀볼 시작", durationMs = 4200 }: PinballArenaProps) {
  const [mapId, setMapId] = useState<MapId>("wheel");
  const [rank, setRank] = useState(1);
  const [skills, setSkills] = useState(true);
  const [balls, setBalls] = useState<RaceBall[]>([]);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<PinballCandidate | null>(null);
  const [finished, setFinished] = useState<RaceBall[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setRunning(false); setBalls([]); setFinished([]); setWinner(null);
  };

  const start = () => {
    if (running || !candidates.length) return;
    const ordered = shuffle(candidates).map((candidate, index) => ({
      ...candidate,
      arrival: 1600 + Math.floor(Math.random() * Math.max(600, durationMs - 1200)) + (skills ? Math.floor(Math.random() * 400) : 0),
      lane: index % 8,
    }));
    const finishOrder = [...ordered].sort((a, b) => a.arrival - b.arrival).map((ball, index) => ({ ...ball, rank: index + 1 }));
    const chosen = finishOrder[Math.min(rank - 1, finishOrder.length - 1)];
    setBalls(ordered); setFinished([]); setWinner(null); setRunning(true);
    timerRef.current = window.setTimeout(() => {
      setFinished(finishOrder); setWinner(chosen); setRunning(false); onComplete(chosen);
    }, Math.max(...ordered.map((ball) => ball.arrival)) + 450);
  };

  return (
    <div className="pinball-arena-card">
      <div className="pinball-toolbar">
        <label>MAP <select value={mapId} disabled={running} onChange={(event) => setMapId(event.target.value as MapId)}>{Object.entries(MAPS).map(([id, map]) => <option value={id} key={id}>{map.icon} {map.label}</option>)}</select></label>
        <label>당첨 순위 <select value={rank} disabled={running} onChange={(event) => setRank(Number(event.target.value))}>{Array.from({ length: Math.max(1, candidates.length) }, (_, index) => <option value={index + 1} key={index}>{index + 1}번째 공</option>)}</select></label>
        <label className="skill-toggle"><input type="checkbox" checked={skills} disabled={running} onChange={(event) => setSkills(event.target.checked)} /> 스킬</label>
        <button className="shuffle-button" type="button" disabled={running || !candidates.length} onClick={() => setBalls(shuffle(candidates).map((candidate, index) => ({ ...candidate, arrival: 0, lane: index % 8 })))}>섞기</button>
      </div>
      <div className={`pinball-arena-board map-${mapId}${running ? " is-live" : ""}`} aria-live="assertive">
        <div className="arena-title">{running ? "GAME ON · 공이 골인하는 순간을 지켜보세요" : winner ? `WINNER · ${winner.label}` : `${MAPS[mapId].icon} PINBALL RANDOMIZER`}</div>
        <div className="arena-obstacles"><i /><i /><i /><i /><b>⚡</b></div>
        <div className="arena-finish-line"><span>GOAL</span></div>
        {balls.map((ball) => <div className={`arena-ball ball-lane-${ball.lane}`} style={{ animationDuration: `${ball.arrival}ms` }} key={ball.id}><span>{ball.label}</span>{ball.rank && !running && <em>{ball.rank}</em>}</div>)}
      </div>
      <div className="pinball-scoreboard">{finished.length ? finished.slice(0, 5).map((ball) => <span key={ball.id}><b>{ball.rank}</b>{ball.label}</span>) : <span>{candidates.length}개 공 대기 중 · 목표 순위: {rank}번째</span>}</div>
      <div className="pinball-arena-actions"><button className="primary-button" type="button" disabled={running || !candidates.length} onClick={start}>{running ? "공이 떨어지는 중..." : buttonLabel} <span>→</span></button><button className="secondary-button" type="button" disabled={running} onClick={reset}>초기화</button></div>
    </div>
  );
}
