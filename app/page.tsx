"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Fuel = "가솔린" | "디젤" | "전기";
type Filter = "전체" | Fuel;
type Vehicle = {
  id: string;
  model: string;
  fuel: Fuel;
  body: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  braking: number;
  color: string;
};

const vehicles = [
  ["x1-18i", "X1 sDrive18i", "가솔린", "SUV", 74, 68, 76, 71, "#4fa3ff"],
  ["x1-20d", "X1 xDrive20d", "디젤", "SUV", 72, 64, 74, 73, "#8297ad"],
  ["ix1-30", "iX1 xDrive30", "전기", "SUV", 82, 88, 80, 84, "#9d7bff"],
  ["x2-20i", "X2 xDrive20i", "가솔린", "SAC", 77, 73, 81, 74, "#ff9b5f"],
  ["ix2-30", "iX2 xDrive30", "전기", "SAC", 83, 89, 84, 85, "#35d7d0"],
  ["320i", "320i", "가솔린", "세단", 80, 78, 86, 82, "#2b80ff"],
  ["320d", "320d", "디젤", "세단", 77, 73, 84, 82, "#65778e"],
  ["330e", "330e", "가솔린", "세단", 82, 82, 87, 84, "#58c1ac"],
  ["m340i", "M340i xDrive", "가솔린", "세단", 94, 92, 91, 90, "#ff4067"],
  ["i4-40", "i4 eDrive40", "전기", "그란 쿠페", 91, 93, 90, 91, "#8c65ff"],
  ["520i", "520i", "가솔린", "세단", 82, 76, 79, 80, "#7099ff"],
  ["520d", "520d", "디젤", "세단", 79, 70, 78, 81, "#6d8194"],
  ["i5-40", "i5 eDrive40", "전기", "세단", 89, 91, 84, 88, "#45d8d2"],
  ["i7-60", "i7 xDrive60", "전기", "세단", 88, 86, 78, 86, "#b28dff"],
  ["x3-20i", "X3 xDrive20i", "가솔린", "SUV", 80, 75, 80, 79, "#4f9dff"],
  ["x3-20d", "X3 xDrive20d", "디젤", "SUV", 78, 70, 78, 80, "#75889c"],
  ["ix3", "iX3", "전기", "SUV", 86, 90, 83, 87, "#41d6c4"],
  ["x5-40i", "X5 xDrive40i", "가솔린", "SUV", 86, 82, 76, 84, "#4e8dff"],
  ["x5-30d", "X5 xDrive30d", "디젤", "SUV", 83, 76, 75, 84, "#738b9c"],
  ["ix", "iX xDrive60", "전기", "SUV", 90, 94, 80, 90, "#9a70ff"],
  ["x7-40i", "X7 xDrive40i", "가솔린", "SUV", 83, 76, 67, 79, "#4b83f6"],
  ["m2", "M2", "가솔린", "쿠페", 97, 95, 96, 93, "#ff3e64"],
  ["m3", "M3 Competition", "가솔린", "세단", 99, 98, 97, 95, "#ff4c66"],
  ["m4", "M4 Competition", "가솔린", "쿠페", 100, 98, 98, 95, "#ff4c66"],
  ["m5", "M5", "가솔린", "세단", 100, 97, 91, 94, "#ff8c44"],
  ["m8", "M8 Competition", "가솔린", "쿠페", 100, 99, 94, 96, "#ff3f76"],
  ["z4", "Z4 M40i", "가솔린", "로드스터", 96, 91, 94, 92, "#ffb04f"],
  ["8coupe", "840i Coupé", "가솔린", "쿠페", 95, 86, 88, 90, "#5b82ff"],
  ["x3m", "X3 M Competition", "가솔린", "SUV", 98, 96, 90, 93, "#ff4765"],
];

const vehicleFrom = (v: readonly (string | number)[]): Vehicle => ({ id: v[0] as string, model: v[1] as string, fuel: v[2] as Fuel, body: v[3] as string, topSpeed: v[4] as number, acceleration: v[5] as number, handling: v[6] as number, braking: v[7] as number, color: v[8] as string });
const roster = vehicles.map((v) => vehicleFrom(v));

function formatTime(ms: number) { const total = Math.max(0, ms) / 1000; return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toFixed(2).padStart(5, "0")}`; }

function RaceCanvas({ vehicle, running, onFinish, onTelemetry, resetKey }: { vehicle: Vehicle; running: boolean; onFinish: (time: number) => void; onTelemetry: (lap: number, speed: number) => void; resetKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef({ left: false, right: false, up: false, down: false });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const setKey = (event: KeyboardEvent, value: boolean) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) keys.current.left = value;
      if (["arrowright", "d"].includes(key)) keys.current.right = value;
      if (["arrowup", "w"].includes(key)) keys.current.up = value;
      if (["arrowdown", "s"].includes(key)) keys.current.down = value;
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) event.preventDefault();
    };
    const down = (e: KeyboardEvent) => setKey(e, true); const up = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr);
    const width = rect.width, height = rect.height; let x = width / 2, roadY = 0, speed = 0, lap = 1, distance = 0, last = performance.now(), raceStarted = last, done = false;
    const traffic = Array.from({ length: 7 }, (_, i) => ({ x: width * (.38 + (i % 3) * .12), y: -180 - i * 230, color: ["#f4d35e", "#d7e2f1", "#ea5f5f", "#74d3c6"][i % 4] }));
    const drawCar = (cx: number, cy: number, color: string, player = false) => { ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(-12, 11, 24, 13); ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(-13, -25, 26, 50, 8); ctx.fill(); ctx.fillStyle = player ? "#dff5ff" : "#b4c8d8"; ctx.beginPath(); ctx.roundRect(-8, -16, 16, 15, 4); ctx.fill(); ctx.fillStyle = "#111a28"; ctx.fillRect(-16, -18, 4, 11); ctx.fillRect(12, -18, 4, 11); ctx.fillRect(-16, 8, 4, 11); ctx.fillRect(12, 8, 4, 11); ctx.fillStyle = player ? "#fff" : "#ffcc6e"; ctx.fillRect(-8, -24, 5, 3); ctx.fillRect(3, -24, 5, 3); ctx.restore(); };
    const draw = (now: number) => {
      const dt = Math.min(32, now - last); last = now; const input = keys.current; const throttle = input.up ? 1 : input.down ? -.45 : .35; speed += throttle * .11 * dt; speed *= .998; speed = Math.max(0, Math.min(vehicle.topSpeed, speed));
      if (input.left) x -= (1.2 + speed / 75) * dt / 2; if (input.right) x += (1.2 + speed / 75) * dt / 2; const roadLeft = width * .23, roadRight = width * .77; if (x < roadLeft + 30 || x > roadRight - 30) speed *= .985; x = Math.max(roadLeft - 12, Math.min(roadRight + 12, x));
      roadY = (roadY + speed * dt * .9) % 96; distance += speed * dt * .012; if (distance > 100) { distance = 0; if (lap < 3) lap += 1; else if (!done) { done = true; onFinish(now - raceStarted); } }
      ctx.fillStyle = "#10221f"; ctx.fillRect(0, 0, width, height); ctx.fillStyle = "#1b403a"; ctx.fillRect(0, 0, width * .23, height); ctx.fillRect(width * .77, 0, width * .23, height); ctx.fillStyle = "#30363d"; ctx.fillRect(width * .23, 0, width * .54, height); ctx.fillStyle = "#f4e7ba"; ctx.fillRect(width * .23, 0, 6, height); ctx.fillRect(width * .77 - 6, 0, 6, height); ctx.setLineDash([50, 46]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,255,255,.36)"; ctx.beginPath(); ctx.moveTo(width * .5, -96 + roadY); ctx.lineTo(width * .5, height + 96); ctx.stroke(); ctx.setLineDash([]);
      traffic.forEach((car, i) => { car.y += speed * dt * .9; if (car.y > height + 80) car.y = -200 - i * 100; drawCar(car.x, car.y, car.color); if (Math.abs(car.x - x) < 27 && Math.abs(car.y - height * .76) < 36) speed *= .94; }); drawCar(x, height * .76, vehicle.color, true);
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(width * .31, 30, width * .38, 4); ctx.fillStyle = "#ffd36d"; ctx.fillRect(width * .31, 30, width * .38 * (distance / 100), 4); ctx.font = "700 11px Arial"; ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fillText(`CHECKPOINT  ${Math.round(distance)}%`, width * .31, 23);
      onTelemetry(lap, Math.round(speed * 3.4));
      if (running && !done) frame.current = requestAnimationFrame(draw); else if (!running) { ctx.fillStyle = "rgba(4,10,18,.28)"; ctx.fillRect(0, 0, width, height); }
    };
    frame.current = requestAnimationFrame(draw); return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [vehicle, running, onFinish, onTelemetry, resetKey]);

  const touch = (name: keyof typeof keys.current, value: boolean) => (e: React.TouchEvent) => { e.preventDefault(); keys.current[name] = value; };
  return <div className="track-wrap"><canvas ref={canvasRef} aria-label="BMW 아케이드 레이싱 트랙" /><div className="touch-pad"><button onTouchStart={touch("left", true)} onTouchEnd={touch("left", false)} aria-label="왼쪽 조향">←</button><button onTouchStart={touch("up", true)} onTouchEnd={touch("up", false)} aria-label="가속">↑</button><button onTouchStart={touch("right", true)} onTouchEnd={touch("right", false)} aria-label="오른쪽 조향">→</button></div></div>;
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>("전체"); const [selected, setSelected] = useState(roster[22]); const [running, setRunning] = useState(false); const [finished, setFinished] = useState(false); const [lap, setLap] = useState(1); const [speed, setSpeed] = useState(0); const [startedAt, setStartedAt] = useState(0); const [elapsed, setElapsed] = useState(0); const [best, setBest] = useState(0); const [resetKey, setResetKey] = useState(1);
  useEffect(() => { const saved = Number(localStorage.getItem("bmw-race-best") || 0); setBest(saved); }, []);
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setElapsed(performance.now() - startedAt), 40); return () => window.clearInterval(timer); }, [running, startedAt]);
  const shown = useMemo(() => filter === "전체" ? roster : roster.filter((v) => v.fuel === filter), [filter]);
  const start = useCallback(() => { setFinished(false); setRunning(true); setLap(1); setSpeed(0); setElapsed(0); setStartedAt(performance.now()); setResetKey((k) => k + 1); }, []);
  const finish = useCallback((time: number) => { const finalTime = Math.max(1, time); setRunning(false); setFinished(true); setElapsed(finalTime); if (!best || finalTime < best) { setBest(finalTime); localStorage.setItem("bmw-race-best", String(finalTime)); } }, [best]);
  const telemetry = useCallback((nextLap: number, nextSpeed: number) => { setLap(nextLap); setSpeed(nextSpeed); }, []);
  return <main className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">B</span><div><p className="eyebrow">BAVARIA / MOTORSPORT</p><h1>BMW <span>APEX</span></h1></div></div><div className="status-pill"><i /> LIVE RACE SYSTEM <b>01</b></div></header><section className="hero-copy"><div><p className="eyebrow blue">THE ULTIMATE DRIVING MACHINE</p><h2>Autobahn <em>Rush</em></h2><p className="lede">독일의 밤을 가르는 3랩 스프린트.<br />당신의 BMW를 선택하고 Apex를 차지하세요.</p></div><div className="hero-stat"><strong>03</strong><span>LAPS<br />TO VICTORY</span></div></section><div className="game-layout"><section className="race-card"><div className="race-head"><div><p className="eyebrow">LIVE CIRCUIT / A-7 BERLIN LOOP</p><h3>{selected.model}</h3></div><div className="telemetry"><div><span>LAP</span><b>{lap}<small> / 3</small></b></div><div><span>SPEED</span><b>{speed}<small> KM/H</small></b></div><div><span>TIME</span><b>{formatTime(elapsed)}</b></div></div></div><RaceCanvas vehicle={selected} running={running} onFinish={finish} onTelemetry={telemetry} resetKey={resetKey} />{finished && <div className="finish-overlay"><span className="eyebrow blue">RACE COMPLETE</span><h3>APEX CAPTURED</h3><p>최종 기록 <strong>{formatTime(elapsed)}</strong></p><button onClick={start}>REPLAY RUN</button></div>}<div className="race-foot"><span>WASD / ARROW KEYS TO DRIVE</span><span>BEST <b>{best ? formatTime(best) : "--:--.--"}</b></span><button className="start-button" onClick={running ? () => setRunning(false) : start}>{running ? "PAUSE RACE" : "START RACE"}<span>↗</span></button></div></section><aside className="garage"><div className="garage-heading"><div><p className="eyebrow blue">YOUR GARAGE</p><h3>Select your machine</h3></div><span className="count">{shown.length.toString().padStart(2, "0")} CARS</span></div><div className="filters">{(["전체", "가솔린", "디젤", "전기"] as Filter[]).map((f) => <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="vehicle-list">{shown.map((v) => <button className={`vehicle-card ${selected.id === v.id ? "selected" : ""}`} key={v.id} onClick={() => { setSelected(v); setRunning(false); setFinished(false); }}><span className="vehicle-swatch" style={{ background: v.color }} /><span className="vehicle-info"><b>{v.model}</b><small>{v.body} <i className={`fuel-${v.fuel}`}>{v.fuel}</i></small></span><span className="vehicle-arrow">{selected.id === v.id ? "●" : "↗"}</span></button>)}</div><div className="selected-spec"><div className="spec-top"><div><p className="eyebrow">SELECTED MACHINE</p><h4>{selected.model}</h4><span className={`fuel-tag fuel-${selected.fuel}`}>{selected.fuel} · {selected.body}</span></div><div className="selected-mark">M</div></div><div className="stat-grid">{[["TOP SPEED", selected.topSpeed], ["ACCELERATION", selected.acceleration], ["HANDLING", selected.handling], ["BRAKING", selected.braking]].map(([label, value]) => <div className="stat" key={label as string}><span>{label as string}</span><b>{value as number}</b><i><em style={{ width: `${value}%` }} /></i></div>)}</div></div></aside></div><footer><span>BMW APEX // FAN-MADE ARCADE EXPERIENCE</span><span>DRIVE RESPONSIBLY · RACE VIRTUALLY</span></footer></main>;
}
