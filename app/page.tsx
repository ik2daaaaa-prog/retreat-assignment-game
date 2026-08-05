"use client";

import { useMemo, useState } from "react";
import { ParticipantSetup } from "./components/ParticipantSetup";
import { Roulette } from "./components/Roulette";
import { AssignmentBoard } from "./components/AssignmentBoard";
import { VehicleRegistration } from "./components/VehicleRegistration";
import { createSeatAssignments, createVehicle, passengerSeatIds, remainingParticipantIds, validateCapacity, type Assignment, type Phase, type Vehicle } from "./lib/assignment";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [participants, setParticipants] = useState<string[]>([]);
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [vehicleLabels, setVehicleLabels] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSeatAssignments, setVehicleSeatAssignments] = useState<Assignment>({});
  const [seatIndex, setSeatIndex] = useState(0);
  const [capacityError, setCapacityError] = useState("");

  const driverCandidates = useMemo(
    () => remainingParticipantIds(participants, driverIds).map((label) => ({ id: label, label })),
    [participants, driverIds],
  );

  const seatQueue = useMemo(() => vehicles.flatMap((vehicle) => passengerSeatIds(vehicle).map((seatId) => ({ vehicleId: vehicle.id, seatId }))), [vehicles]);
  const currentSeat = seatQueue[seatIndex];
  const seatCandidates = useMemo(() => remainingParticipantIds(participants, Object.values(vehicleSeatAssignments)).map((label) => ({ id: label, label })), [participants, vehicleSeatAssignments]);
  const reset = () => { setParticipants([]); setDriverIds([]); setVehicleLabels({}); setVehicles([]); setVehicleSeatAssignments({}); setSeatIndex(0); setCapacityError(""); setPhase("setup"); };
  const registerVehicles = () => {
    const nextVehicles = driverIds.map((driverId, index) => createVehicle(`vehicle-${index + 1}`, driverId, vehicleLabels[driverId] || ""));
    const capacity = validateCapacity(participants.length, nextVehicles);
    if (!capacity.valid) { setCapacityError(`좌석이 ${capacity.missingSeats}자리 부족합니다. 운전자를 추가하거나 차량을 수정하세요.`); return; }
    setCapacityError(""); setVehicles(nextVehicles); setVehicleSeatAssignments(Object.assign({}, ...nextVehicles.map(createSeatAssignments))); setSeatIndex(0); setPhase("seats");
  };

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

      {phase === "vehicles" && <VehicleRegistration driverIds={driverIds} values={vehicleLabels} onChange={(driverId, label) => setVehicleLabels((current) => ({ ...current, [driverId]: label }))} onContinue={registerVehicles} error={capacityError} />}

      {phase === "seats" && currentSeat && <section className="game-card"><div className="section-kicker">ROUND 03 · SEAT DRAW {seatIndex + 1}/{seatQueue.length}</div><h2>차량 좌석을 배정합니다</h2><p className="intro">현재 좌석: <b>{vehicles.find((vehicle) => vehicle.id === currentSeat.vehicleId)?.label}</b> · <b>{currentSeat.seatId}</b></p><div className="game-grid"><Roulette candidates={seatCandidates} onComplete={(winner) => { setVehicleSeatAssignments((current) => ({ ...current, [`${currentSeat.vehicleId}:${currentSeat.seatId}`]: winner.id })); if (seatIndex + 1 >= seatQueue.length) setPhase("rooms"); else setSeatIndex((current) => current + 1); }} buttonLabel="좌석 추첨" /><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /></div><button className="back-button" type="button" onClick={() => setPhase("vehicles")}>← 차량 정보 수정</button></section>}

      {phase !== "setup" && phase !== "drivers" && phase !== "vehicles" && phase !== "seats" && <section className="game-card"><div className="section-kicker">NEXT ROUND</div><h2>방과 설거지 배정이 이어집니다</h2><p className="intro">차량 좌석 배정이 끝났습니다. 다음 단계에서 방과 설거지 역할을 설정합니다.</p><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /><button className="back-button" type="button" onClick={() => setPhase("seats")}>← 좌석 다시 보기</button></section>}
      <footer><span>RETREAT RANDOMIZER · FAIR BY DESIGN</span><span>{participants.length} PARTICIPANTS · {driverIds.length} DRIVERS</span></footer>
    </main>
  );
}
