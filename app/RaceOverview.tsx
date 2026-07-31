"use client";

import { useEffect, useState } from "react";

const rivals = [
  { name: "M4", color: "#ff4c66", delay: "0s" },
  { name: "iX3", color: "#41d6c4", delay: "-1.8s" },
  { name: "X5", color: "#ffd36d", delay: "-3.4s" },
  { name: "M2", color: "#9d7bff", delay: "-5.2s" },
];

export default function RaceOverview() {
  const [lap, setLap] = useState(1);
  useEffect(() => { const timer = window.setInterval(() => setLap((value) => value === 3 ? 1 : value + 1), 6200); return () => window.clearInterval(timer); }, []);
  return <aside className="race-overview" aria-label="전체 레이스 현황"><div className="overview-head"><div><span className="live-dot" /> <span className="eyebrow blue">LIVE OVERVIEW</span></div><b>A-7 BERLIN LOOP</b></div><div className="overview-track"><span className="track-glow" />{rivals.map((rival) => <span key={rival.name} className="rival-dot" style={{ background: rival.color, animationDelay: rival.delay }} title={rival.name} />)}<span className="player-dot" title="YOU" /><div className="finish-line">FINISH</div></div><div className="overview-foot"><div><span className="eyebrow">CURRENT LAP</span><strong>{lap}<small> / 3</small></strong></div><div className="standings"><span className="eyebrow">STANDINGS</span><b><i /> YOU <em>P1</em></b><b><i /> M4 <em>P2</em></b><b><i /> iX3 <em>P3</em></b></div><div className="boost-meter"><span className="eyebrow">RACE INTENSITY</span><i><em /></i><b>HIGH</b></div></div></aside>;
}
