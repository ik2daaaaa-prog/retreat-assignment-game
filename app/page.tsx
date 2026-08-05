"use client";

import { useEffect, useMemo, useState } from "react";
import { AssignmentBoard } from "./components/AssignmentBoard";
import { ParticipantSetup } from "./components/ParticipantSetup";
import { BombPassBoard } from "./components/BombPassBoard";
import { VehicleRegistration } from "./components/VehicleRegistration";
import { balanceVehicleSeats, createSeatAssignments, createVehicle, driverSelectionComplete, passengerSeatIds, remainingParticipantIds, resetGamePhase, roomCandidateIds, validateCapacity, type Assignment, type Phase, type Vehicle } from "./lib/assignment";

type Room = { id: string; label: string; capacity: number };
const seatNames: Record<string, string> = { "front-right": "조수석", "row2-left": "2열 왼쪽", "row2-right": "2열 오른쪽", "row3-left": "3열 왼쪽", "row3-right": "3열 오른쪽" };

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [participants, setParticipants] = useState<string[]>([]);
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [driverTarget, setDriverTarget] = useState(1);
  const [vehicleLabels, setVehicleLabels] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSeatAssignments, setVehicleSeatAssignments] = useState<Assignment>({});
  const [seatIndex, setSeatIndex] = useState(0);
  const [capacityError, setCapacityError] = useState("");
  const [rooms, setRooms] = useState<Room[]>([{ id: "room-1", label: "1호실", capacity: 2 }]);
  const [roomAssignments, setRoomAssignments] = useState<Assignment>({});
  const [roomSlotIndex, setRoomSlotIndex] = useState(0);
  const [roomError, setRoomError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const driverCandidates = useMemo(() => remainingParticipantIds(participants, driverIds).map((label) => ({ id: label, label })), [participants, driverIds]);
  const seatQueue = useMemo(() => vehicles.flatMap((vehicle) => passengerSeatIds(vehicle).map((seatId) => ({ vehicleId: vehicle.id, seatId }))), [vehicles]);
  const currentSeat = seatQueue[seatIndex];
  const seatCandidates = useMemo(() => remainingParticipantIds(participants, Object.values(vehicleSeatAssignments)).map((label) => ({ id: label, label })), [participants, vehicleSeatAssignments]);
  const roomQueue = useMemo(() => rooms.flatMap((room) => Array.from({ length: Math.max(0, room.capacity) }, (_, index) => ({ roomId: room.id, index }))), [rooms]);
  const currentRoomSlot = roomQueue[roomSlotIndex];
  const roomCandidates = useMemo(() => roomCandidateIds(participants, roomAssignments).map((label) => ({ id: label, label })), [participants, roomAssignments]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("retreat-assignment-game-v1");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPhase(data.phase || "setup"); setParticipants(data.participants || []); setDriverIds(data.driverIds || []); setDriverTarget(data.driverTarget || 1); setVehicleLabels(data.vehicleLabels || {}); setVehicles(data.vehicles || []); setVehicleSeatAssignments(data.vehicleSeatAssignments || {}); setSeatIndex(data.seatIndex || 0); setRooms(data.rooms || [{ id: "room-1", label: "1호실", capacity: 2 }]); setRoomAssignments(data.roomAssignments || {}); setRoomSlotIndex(data.roomSlotIndex || 0);
        } catch { localStorage.removeItem("retreat-assignment-game-v1"); }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("retreat-assignment-game-v1", JSON.stringify({ phase, participants, driverIds, driverTarget, vehicleLabels, vehicles, vehicleSeatAssignments, seatIndex, rooms, roomAssignments, roomSlotIndex })); }, [hydrated, phase, participants, driverIds, driverTarget, vehicleLabels, vehicles, vehicleSeatAssignments, seatIndex, rooms, roomAssignments, roomSlotIndex]);

  const reset = () => { localStorage.removeItem("retreat-assignment-game-v1"); setPhase(resetGamePhase()); setParticipants([]); setDriverIds([]); setDriverTarget(1); setVehicleLabels({}); setVehicles([]); setVehicleSeatAssignments({}); setSeatIndex(0); setRooms([{ id: "room-1", label: "1호실", capacity: 2 }]); setRoomAssignments({}); setRoomSlotIndex(0); setCapacityError(""); setRoomError(""); };
  const registerVehicles = () => {
    const nextVehicles = balanceVehicleSeats(driverIds.map((driverId, index) => createVehicle(`vehicle-${index + 1}`, driverId, vehicleLabels[driverId] || "")), participants.length);
    const capacity = validateCapacity(participants.length, nextVehicles);
    if (!capacity.valid) { setCapacityError(`좌석이 ${capacity.missingSeats}자리 부족합니다. 운전자를 추가하거나 차량을 수정하세요.`); return; }
    setCapacityError(""); setVehicles(nextVehicles); setVehicleSeatAssignments(Object.assign({}, ...nextVehicles.map(createSeatAssignments))); setSeatIndex(0); setPhase("seats");
  };
  const startRooms = () => {
    const capacity = rooms.reduce((total, room) => total + Math.max(0, room.capacity), 0);
    if (!rooms.length || capacity < participants.length) { setRoomError(`방 정원이 ${participants.length - capacity}자리 부족합니다.`); return; }
    setRoomError(""); setRoomAssignments({}); setRoomSlotIndex(0); setPhase("rooms");
  };
  const summaryText = [...vehicles.map((vehicle) => `${vehicle.label}: ${vehicleSeatAssignments[`${vehicle.id}:driver`] || vehicle.driverId}`), ...rooms.map((room) => `${room.label}: ${Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${room.id}:`)).map(([, value]) => value).join(", ")}`)].join("\n");

  return <main className="app-shell">
    <header className="topbar"><button className="brand-home" type="button" onClick={reset} aria-label="처음 화면으로 돌아가기"><span className="brand-lockup"><span className="brand-mark">ㅋㅋㅋ</span><span><span className="section-kicker">WEEKEND RETREAT · RANDOMIZER</span><h1>나만 아니면 <em>돼!!!</em></h1></span></span></button><button className="text-button" type="button" onClick={reset}>전체 초기화</button></header>
    <section className="progress-strip" aria-label="진행 단계">{["참가자", "운전자", "차량·좌석", "방"].map((label, index) => <span className={(index === 0 && phase === "setup") || (index === 1 && phase === "drivers") ? "active" : ""} key={label}><b>{String(index + 1).padStart(2, "0")}</b>{label}</span>)}</section>
    {phase === "setup" && <ParticipantSetup participants={participants} onChange={setParticipants} onStart={(count) => { setDriverTarget(count); setDriverIds([]); setPhase("drivers"); }} />}
    {phase === "drivers" && <section className="game-card"><div className="section-kicker">ROUND 01 · BOMB DRIVER DRAW</div><h2>폭탄이 멈춘 사람이 운전자!</h2><p className="intro">필요한 운전자 수: <b>{driverTarget}명</b> · 현재 추첨: <b>{driverIds.length}/{driverTarget}명</b></p><div className="game-grid"><BombPassBoard candidates={driverCandidates} onComplete={(winner) => setDriverIds((current) => current.length < driverTarget ? [...current, winner.id] : current)} buttonLabel="운전자 폭탄 돌리기" /><aside className="result-panel"><div className="panel-label">확정된 운전자</div>{driverIds.length ? driverIds.map((id, index) => <div className="result-row" key={id}><span>DRIVER {String(index + 1).padStart(2, "0")}</span><strong>{id}</strong></div>) : <p className="empty-state">아직 폭탄을 돌리지 않았습니다.</p>}<button className="primary-button" type="button" disabled={!driverSelectionComplete(driverIds.length, driverTarget)} onClick={() => setPhase("vehicles")}>운전자 확정 <span>→</span></button></aside></div><button className="back-button" type="button" onClick={() => setPhase("setup")}>← 참가자 수정</button></section>}
    {phase === "vehicles" && <VehicleRegistration driverIds={driverIds} values={vehicleLabels} onChange={(driverId, label) => setVehicleLabels((current) => ({ ...current, [driverId]: label }))} onContinue={registerVehicles} error={capacityError} />}
    {phase === "seats" && currentSeat && <section className="game-card"><div className="section-kicker">ROUND 03 · BOMB SEAT DRAW {seatIndex + 1}/{seatQueue.length}</div><h2>폭탄이 멈춘 사람이 이 좌석!</h2><p className="intro">현재 좌석: <b>{vehicles.find((vehicle) => vehicle.id === currentSeat.vehicleId)?.label}</b> · <b>{seatNames[currentSeat.seatId] || currentSeat.seatId}</b></p><div className="game-grid"><BombPassBoard key={`seat-${currentSeat.vehicleId}-${currentSeat.seatId}`} candidates={seatCandidates} durationMs={5000} onComplete={(winner) => { setVehicleSeatAssignments((current) => ({ ...current, [`${currentSeat.vehicleId}:${currentSeat.seatId}`]: winner.id })); if (seatIndex + 1 >= seatQueue.length) setPhase("roomSetup"); else setSeatIndex((current) => current + 1); }} buttonLabel="좌석 폭탄 돌리기" /><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /></div><button className="back-button" type="button" onClick={() => setPhase("vehicles")}>← 차량 정보 수정</button></section>}
    {phase === "roomSetup" && <section className="game-card"><div className="section-kicker">ROUND 04 · ROOM SETUP</div><h2>방과 정원을 입력하세요</h2><p className="intro">방 정원 합계가 참가자 수 이상이어야 합니다.</p><div className="room-editor">{rooms.map((room) => <div className="room-edit-row" key={room.id}><input value={room.label} aria-label="방 이름" onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, label: event.target.value } : item))} /><input type="number" min="1" value={room.capacity} aria-label="방 정원" onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, capacity: Number(event.target.value) } : item))} /><button className="text-button" type="button" onClick={() => setRooms((current) => current.filter((item) => item.id !== room.id))}>삭제</button></div>)}</div><button className="secondary-button" type="button" onClick={() => setRooms((current) => [...current, { id: `room-${Date.now()}`, label: `${current.length + 1}호실`, capacity: 2 }])}>방 추가</button>{roomError && <p className="error-message" role="alert">{roomError}</p>}<button className="primary-button" type="button" onClick={startRooms}>방 배정 시작 <span>→</span></button></section>}
    {phase === "rooms" && currentRoomSlot && <section className="game-card"><div className="section-kicker">ROUND 04 · BOMB ROOM DRAW {roomSlotIndex + 1}/{roomQueue.length}</div><h2>{rooms.find((room) => room.id === currentRoomSlot.roomId)?.label} 폭탄돌리기</h2><p className="intro">폭탄이 멈춘 참가자가 이 방에 배정됩니다.</p><div className="game-grid"><BombPassBoard candidates={roomCandidates} durationMs={4500} onComplete={(winner) => { setRoomAssignments((current) => ({ ...current, [`${currentRoomSlot.roomId}:${currentRoomSlot.index}`]: winner.id })); if (roomSlotIndex + 1 >= roomQueue.length) setPhase("summary"); else setRoomSlotIndex((current) => current + 1); }} buttonLabel="방 폭탄 돌리기" /><aside className="result-panel"><div className="panel-label">현재 방 결과</div>{Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${currentRoomSlot.roomId}:`)).map(([key, value]) => <div className="result-row" key={key}><span>ROOM SEAT</span><strong>{value}</strong></div>)}</aside></div></section>}
    {phase === "summary" && <section className="game-card"><div className="section-kicker">FINAL · ALL ASSIGNMENTS</div><h2>야유회 배정이 끝났습니다</h2><p className="intro">차량 좌석과 방 배정 결과를 확인하세요.</p><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /><div className="summary-list">{rooms.map((room) => <div className="vehicle-result" key={room.id}><div className="panel-label">{room.label}</div>{Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${room.id}:`)).map(([key, value]) => <div className="seat-row" key={key}><span>투숙자</span><strong>{value}</strong></div>)}</div>)}</div><div className="summary-actions"><button className="secondary-button" type="button" onClick={() => navigator.clipboard?.writeText(summaryText)}>결과 복사</button><button className="secondary-button" type="button" onClick={() => window.print()}>인쇄</button><button className="primary-button" type="button" onClick={reset}>새 게임</button></div></section>}
    <footer><span>RETREAT RANDOMIZER · FAIR BY DESIGN</span><span>{participants.length} PARTICIPANTS · {driverIds.length} DRIVERS</span></footer>
  </main>;
}
