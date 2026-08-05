"use client";

import { useMemo, useState } from "react";
import { ParticipantSetup } from "./components/ParticipantSetup";
import { Roulette } from "./components/Roulette";
import { remainingParticipantIds, type Phase } from "./lib/assignment";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [participants, setParticipants] = useState<string[]>([]);
  const [driverIds, setDriverIds] = useState<string[]>([]);

  const driverCandidates = useMemo(
    () => remainingParticipantIds(participants, driverIds).map((label) => ({ id: label, label })),
    [participants, driverIds],
  );

  const reset = () => { setParticipants([]); setDriverIds([]); setPhase("setup"); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">Y</span><div><div className="section-kicker">WEEKEND RETREAT · RANDOMIZER</div><h1>우리들의 <em>야유회</em></h1></div></div>
        <button className="text-button" type="button" onClick={reset}>전체 초기화</button>
      </header>

      <section className="progress-strip" aria-label="진행 단계">
        {["참가자", "운전자", "차량·좌석", "방", "설거지"].map((label, index) => <span className={index === 0 && phase === "setup" || index === 1 && phase === "drivers" ? "active" : ""} key={label}><b>{String(index + 1).padStart(2, "0")}</b>{label}</span>)}
      </section>

      {phase === "setup" && <ParticipantSetup participants={participants} onChange={setParticipants} onStart={() => setPhase("drivers")} />}

      {phase === "drivers" && (
        <section className="game-card">
          <div className="section-kicker">ROUND 01 · DRIVER DRAW</div>
          <h2>오늘의 운전자를 뽑습니다</h2>
          <p className="intro">필요한 만큼 운전자를 추가 추첨한 뒤, 차량을 입력할 준비가 되면 확정하세요.</p>
          <div className="game-grid">
            <Roulette candidates={driverCandidates} onComplete={(winner) => setDriverIds((current) => [...current, winner.id])} buttonLabel="운전자 추첨" />
            <aside className="result-panel"><div className="panel-label">확정된 운전자</div>{driverIds.length ? driverIds.map((id, index) => <div className="result-row" key={id}><span>DRIVER {String(index + 1).padStart(2, "0")}</span><strong>{id}</strong></div>) : <p className="empty-state">아직 추첨 결과가 없습니다.</p>}<button className="primary-button" type="button" disabled={driverIds.length === 0} onClick={() => setPhase("vehicles")}>운전자 확정 <span>→</span></button></aside>
          </div>
          <button className="back-button" type="button" onClick={() => setPhase("setup")}>← 참가자 수정</button>
        </section>
      )}

      {phase !== "setup" && phase !== "drivers" && <section className="game-card"><div className="section-kicker">NEXT ROUND</div><h2>다음 배정 준비 중입니다</h2><p className="intro">차량 등록과 좌석 배정 화면이 이어집니다.</p><button className="back-button" type="button" onClick={() => setPhase("drivers")}>← 운전자 다시 보기</button></section>}
      <footer><span>RETREAT RANDOMIZER · FAIR BY DESIGN</span><span>{participants.length} PARTICIPANTS · {driverIds.length} DRIVERS</span></footer>
    </main>
  );
}
