"use client";

import { useEffect, useMemo, useState } from "react";
import { AssignmentBoard } from "./components/AssignmentBoard";
import { ParticipantSetup } from "./components/ParticipantSetup";
import { Roulette } from "./components/Roulette";
import { VehicleRegistration } from "./components/VehicleRegistration";
import { choreCandidateIds, createSeatAssignments, createVehicle, passengerSeatIds, remainingParticipantIds, roomCandidateIds, validateCapacity, type Assignment, type Phase, type Vehicle } from "./lib/assignment";

type Room = { id: string; label: string; capacity: number };
const seatNames: Record<string, string> = { "front-right": "조수석", "row2-left": "2열 왼쪽", "row2-right": "2열 오른쪽", "row3-left": "3열 왼쪽", "row3-right": "3열 오른쪽" };

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [participants, setParticipants] = useState<string[]>([]);
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [vehicleLabels, setVehicleLabels] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSeatAssignments, setVehicleSeatAssignments] = useState<Assignment>({});
  const [seatIndex, setSeatIndex] = useState(0);
  const [capacityError, setCapacityError] = useState("");
  const [rooms, setRooms] = useState<Room[]>([{ id: "room-1", label: "1호실", capacity: 2 }]);
  const [roomAssignments, setRoomAssignments] = useState<Assignment>({});
  const [roomSlotIndex, setRoomSlotIndex] = useState(0);
  const [chores, setChores] = useState<string[]>(["식사 후 설거지"]);
  const [choreAssignments, setChoreAssignments] = useState<Assignment>({});
  const [choreIndex, setChoreIndex] = useState(0);
  const [roomError, setRoomError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const driverCandidates = useMemo(() => remainingParticipantIds(participants, driverIds).map((label) => ({ id: label, label })), [participants, driverIds]);
  const seatQueue = useMemo(() => vehicles.flatMap((vehicle) => passengerSeatIds(vehicle).map((seatId) => ({ vehicleId: vehicle.id, seatId }))), [vehicles]);
  const currentSeat = seatQueue[seatIndex];
  const seatCandidates = useMemo(() => remainingParticipantIds(participants, Object.values(vehicleSeatAssignments)).map((label) => ({ id: label, label })), [participants, vehicleSeatAssignments]);
  const roomQueue = useMemo(() => rooms.flatMap((room) => Array.from({ length: Math.max(0, room.capacity) }, (_, index) => ({ roomId: room.id, index }))), [rooms]);
  const currentRoomSlot = roomQueue[roomSlotIndex];
  const roomCandidates = useMemo(() => roomCandidateIds(participants, roomAssignments).map((label) => ({ id: label, label })), [participants, roomAssignments]);
  const choreCandidates = useMemo(() => choreCandidateIds(participants).map((label) => ({ id: label, label })), [participants]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("retreat-assignment-game-v1");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPhase(data.phase || "setup"); setParticipants(data.participants || []); setDriverIds(data.driverIds || []); setVehicleLabels(data.vehicleLabels || {}); setVehicles(data.vehicles || []); setVehicleSeatAssignments(data.vehicleSeatAssignments || {}); setSeatIndex(data.seatIndex || 0); setRooms(data.rooms || [{ id: "room-1", label: "1호실", capacity: 2 }]); setRoomAssignments(data.roomAssignments || {}); setRoomSlotIndex(data.roomSlotIndex || 0); setChores(data.chores || ["식사 후 설거지"]); setChoreAssignments(data.choreAssignments || {}); setChoreIndex(data.choreIndex || 0);
        } catch { localStorage.removeItem("retreat-assignment-game-v1"); }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("retreat-assignment-game-v1", JSON.stringify({ phase, participants, driverIds, vehicleLabels, vehicles, vehicleSeatAssignments, seatIndex, rooms, roomAssignments, roomSlotIndex, chores, choreAssignments, choreIndex })); }, [hydrated, phase, participants, driverIds, vehicleLabels, vehicles, vehicleSeatAssignments, seatIndex, rooms, roomAssignments, roomSlotIndex, chores, choreAssignments, choreIndex]);

  const reset = () => { localStorage.removeItem("retreat-assignment-game-v1"); setPhase("setup"); setParticipants([]); setDriverIds([]); setVehicleLabels({}); setVehicles([]); setVehicleSeatAssignments({}); setSeatIndex(0); setRooms([{ id: "room-1", label: "1호실", capacity: 2 }]); setRoomAssignments({}); setRoomSlotIndex(0); setChores(["식사 후 설거지"]); setChoreAssignments({}); setChoreIndex(0); setCapacityError(""); setRoomError(""); };
  const registerVehicles = () => {
    const nextVehicles = driverIds.map((driverId, index) => createVehicle(`vehicle-${index + 1}`, driverId, vehicleLabels[driverId] || ""));
    const capacity = validateCapacity(participants.length, nextVehicles);
    if (!capacity.valid) { setCapacityError(`좌석이 ${capacity.missingSeats}자리 부족합니다. 운전자를 추가하거나 차량을 수정하세요.`); return; }
    setCapacityError(""); setVehicles(nextVehicles); setVehicleSeatAssignments(Object.assign({}, ...nextVehicles.map(createSeatAssignments))); setSeatIndex(0); setPhase("seats");
  };
  const startRooms = () => {
    const capacity = rooms.reduce((total, room) => total + Math.max(0, room.capacity), 0);
    if (!rooms.length || capacity < participants.length) { setRoomError(`방 정원이 ${participants.length - capacity}자리 부족합니다.`); return; }
    setRoomError(""); setRoomAssignments({}); setRoomSlotIndex(0); setPhase("rooms");
  };
  const summaryText = [...vehicles.map((vehicle) => `${vehicle.label} (${vehicleSeatAssignments[`${vehicle.id}:driver`] || vehicle.driverId})`), ...rooms.map((room) => `${room.label}: ${Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${room.id}:`)).map(([, value]) => value).join(", ")}`), ...chores.map((chore, index) => `${chore}: ${choreAssignments[`chore-${index}`] || ""}`)].join("\n");

  return <main className="app-shell">
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark">Y</span><div><div className="section-kicker">WEEKEND RETREAT · RANDOMIZER</div><h1>우리들의 <em>야유회</em></h1></div></div><button className="text-button" type="button" onClick={reset}>전체 초기화</button></header>
    <section className="progress-strip" aria-label="진행 단계">{["참가자", "운전자", "차량·좌석", "방", "설거지"].map((label, index) => <span className={(index === 0 && phase === "setup") || (index === 1 && phase === "drivers") ? "active" : ""} key={label}><b>{String(index + 1).padStart(2, "0")}</b>{label}</span>)}</section>
    {phase === "setup" && <ParticipantSetup participants={participants} onChange={setParticipants} onStart={() => setPhase("drivers")} />}
    {phase === "drivers" && <section className="game-card"><div className="section-kicker">ROUND 01 · DRIVER DRAW</div><h2>오늘의 운전자를 뽑습니다</h2><p className="intro">필요한 만큼 운전자를 추가 추첨한 뒤 차량을 입력할 준비가 되면 확정하세요.</p><div className="game-grid"><Roulette candidates={driverCandidates} onComplete={(winner) => setDriverIds((current) => [...current, winner.id])} buttonLabel="운전자 추첨" /><aside className="result-panel"><div className="panel-label">확정된 운전자</div>{driverIds.length ? driverIds.map((id, index) => <div className="result-row" key={id}><span>DRIVER {String(index + 1).padStart(2, "0")}</span><strong>{id}</strong></div>) : <p className="empty-state">아직 추첨 결과가 없습니다.</p>}<button className="primary-button" type="button" disabled={!driverIds.length} onClick={() => setPhase("vehicles")}>운전자 확정 <span>→</span></button></aside></div><button className="back-button" type="button" onClick={() => setPhase("setup")}>← 참가자 수정</button></section>}
    {phase === "vehicles" && <VehicleRegistration driverIds={driverIds} values={vehicleLabels} onChange={(driverId, label) => setVehicleLabels((current) => ({ ...current, [driverId]: label }))} onContinue={registerVehicles} error={capacityError} />}
    {phase === "seats" && currentSeat && <section className="game-card"><div className="section-kicker">ROUND 03 · SEAT DRAW {seatIndex + 1}/{seatQueue.length}</div><h2>차량 좌석을 배정합니다</h2><p className="intro">현재 좌석: <b>{vehicles.find((vehicle) => vehicle.id === currentSeat.vehicleId)?.label}</b> · <b>{seatNames[currentSeat.seatId] || currentSeat.seatId}</b></p><div className="game-grid"><Roulette candidates={seatCandidates} onComplete={(winner) => { setVehicleSeatAssignments((current) => ({ ...current, [`${currentSeat.vehicleId}:${currentSeat.seatId}`]: winner.id })); if (seatIndex + 1 >= seatQueue.length) setPhase("roomSetup"); else setSeatIndex((current) => current + 1); }} buttonLabel="좌석 추첨" /><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /></div><button className="back-button" type="button" onClick={() => setPhase("vehicles")}>← 차량 정보 수정</button></section>}
    {phase === "roomSetup" && <section className="game-card"><div className="section-kicker">ROUND 04 · ROOM SETUP</div><h2>방과 정원을 입력하세요</h2><p className="intro">방 정원 합계가 참가자 수 이상이어야 합니다.</p><div className="room-editor">{rooms.map((room) => <div className="room-edit-row" key={room.id}><input value={room.label} aria-label="방 이름" onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, label: event.target.value } : item))} /><input type="number" min="1" value={room.capacity} aria-label="방 정원" onChange={(event) => setRooms((current) => current.map((item) => item.id === room.id ? { ...item, capacity: Number(event.target.value) } : item))} /><button className="text-button" type="button" onClick={() => setRooms((current) => current.filter((item) => item.id !== room.id))}>삭제</button></div>)}</div><button className="secondary-button" type="button" onClick={() => setRooms((current) => [...current, { id: `room-${Date.now()}`, label: `${current.length + 1}호실`, capacity: 2 }])}>방 추가</button>{roomError && <p className="error-message" role="alert">{roomError}</p>}<button className="primary-button" type="button" onClick={startRooms}>방 배정 시작 <span>→</span></button></section>}
    {phase === "rooms" && currentRoomSlot && <section className="game-card"><div className="section-kicker">ROUND 04 · ROOM DRAW {roomSlotIndex + 1}/{roomQueue.length}</div><h2>{rooms.find((room) => room.id === currentRoomSlot.roomId)?.label} 배정</h2><p className="intro">방 정원에 맞춰 참가자를 한 명씩 추첨합니다.</p><div className="game-grid"><Roulette candidates={roomCandidates} onComplete={(winner) => { setRoomAssignments((current) => ({ ...current, [`${currentRoomSlot.roomId}:${currentRoomSlot.index}`]: winner.id })); if (roomSlotIndex + 1 >= roomQueue.length) setPhase("choreSetup"); else setRoomSlotIndex((current) => current + 1); }} buttonLabel="방 추첨" /><aside className="result-panel"><div className="panel-label">현재 방 결과</div>{Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${currentRoomSlot.roomId}:`)).map(([key, value]) => <div className="result-row" key={key}><span>ROOM SEAT</span><strong>{value}</strong></div>)}</aside></div></section>}
    {phase === "choreSetup" && <section className="game-card"><div className="section-kicker">ROUND 05 · CHORE SETUP</div><h2>설거지 역할을 입력하세요</h2><p className="intro">역할 수만큼 담당자를 추첨합니다. 한 사람이 여러 역할을 맡을 수 있습니다.</p><div className="room-editor">{chores.map((chore, index) => <div className="room-edit-row" key={`${chore}-${index}`}><input value={chore} aria-label="설거지 역할" onChange={(event) => setChores((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button className="text-button" type="button" onClick={() => setChores((current) => current.filter((_, itemIndex) => itemIndex !== index))}>삭제</button></div>)}</div><button className="secondary-button" type="button" onClick={() => setChores((current) => [...current, "추가 설거지"])}>역할 추가</button><button className="primary-button" type="button" disabled={!chores.length} onClick={() => { setChoreAssignments({}); setChoreIndex(0); setPhase("chores"); }}>설거지 추첨 시작 <span>→</span></button></section>}
    {phase === "chores" && <section className="game-card"><div className="section-kicker">ROUND 05 · CHORE DRAW {choreIndex + 1}/{chores.length}</div><h2>{chores[choreIndex]} 담당자</h2><p className="intro">전체 참가자 중에서 추첨합니다.</p><div className="game-grid"><Roulette candidates={choreCandidates} onComplete={(winner) => { setChoreAssignments((current) => ({ ...current, [`chore-${choreIndex}`]: winner.id })); if (choreIndex + 1 >= chores.length) setPhase("summary"); else setChoreIndex((current) => current + 1); }} buttonLabel="담당자 추첨" /><aside className="result-panel"><div className="panel-label">확정된 역할</div>{Object.entries(choreAssignments).map(([key, value]) => <div className="result-row" key={key}><span>{chores[Number(key.split("-")[1])]}</span><strong>{value}</strong></div>)}</aside></div></section>}
    {phase === "summary" && <section className="game-card"><div className="section-kicker">FINAL · ALL ASSIGNMENTS</div><h2>야유회 배정이 끝났습니다</h2><p className="intro">차량 좌석, 방, 설거지 담당 결과를 확인하세요.</p><AssignmentBoard vehicles={vehicles} assignments={vehicleSeatAssignments} /><div className="summary-list">{rooms.map((room) => <div className="vehicle-result" key={room.id}><div className="panel-label">{room.label}</div>{Object.entries(roomAssignments).filter(([key]) => key.startsWith(`${room.id}:`)).map(([key, value]) => <div className="seat-row" key={key}><span>투숙자</span><strong>{value}</strong></div>)}</div>)}{chores.map((chore, index) => <div className="seat-row" key={`${chore}-${index}`}><span>{chore}</span><strong>{choreAssignments[`chore-${index}`]}</strong></div>)}</div><div className="summary-actions"><button className="secondary-button" type="button" onClick={() => navigator.clipboard?.writeText(summaryText)}>결과 복사</button><button className="secondary-button" type="button" onClick={() => window.print()}>인쇄</button><button className="primary-button" type="button" onClick={reset}>새 게임</button></div></section>}
    <footer><span>RETREAT RANDOMIZER · FAIR BY DESIGN</span><span>{participants.length} PARTICIPANTS · {driverIds.length} DRIVERS</span></footer>
  </main>;
}
