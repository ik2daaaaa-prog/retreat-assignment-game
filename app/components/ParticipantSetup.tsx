"use client";

import { useState } from "react";
import { normalizeDriverCount } from "../lib/assignment";

type ParticipantSetupProps = {
  participants: string[];
  onChange: (participants: string[]) => void;
  onStart: (driverCount: number) => void;
};

export function ParticipantSetup({ participants, onChange, onStart }: ParticipantSetupProps) {
  const [draft, setDraft] = useState("");
  const [driverCount, setDriverCount] = useState("1");

  const addParticipant = () => {
    const name = draft.trim();
    if (!name || participants.includes(name)) return;
    onChange([...participants, name]);
    setDraft("");
  };

  return (
    <section className="setup-card">
      <div className="section-kicker">ROUND 00 · CHECK-IN</div>
      <h2>야유회 랜덤 배정 게임</h2>
      <p className="intro">참가자를 등록하면 운전자부터 차량 좌석과 방까지 룰렛으로 정합니다.</p>
      <div className="input-row">
        <input
          value={draft}
          maxLength={20}
          placeholder="참가자 이름 입력"
          aria-label="참가자 이름"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") addParticipant(); }}
        />
        <button className="secondary-button" type="button" onClick={addParticipant}>참가자 추가</button>
      </div>
      <div className="participant-list" aria-live="polite">
        {participants.length === 0 ? <span className="empty-state">아직 참가자가 없습니다.</span> : participants.map((participant, index) => (
          <button className="name-chip" type="button" key={participant} onClick={() => onChange(participants.filter((name) => name !== participant))} aria-label={`${participant} 삭제`}>
            <span>{String(index + 1).padStart(2, "0")}</span>{participant} ×
          </button>
        ))}
      </div>
      <div className="driver-count-row"><label htmlFor="driver-count">필요한 운전자 수</label><input id="driver-count" type="number" min="1" max={Math.max(1, participants.length)} value={driverCount} onChange={(event) => setDriverCount(event.target.value.replace(/[^0-9]/g, ""))} /><span>명</span></div>
      <button className="primary-button" type="button" disabled={participants.length < 2} onClick={() => onStart(normalizeDriverCount(Number(driverCount || "1"), participants.length))}>게임 시작 <span>→</span></button>
      <p className="hint">최소 2명 · 이름을 눌러 삭제 · 운전자 수는 참가자 수 이내</p>
    </section>
  );
}
