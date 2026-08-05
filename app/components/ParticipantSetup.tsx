"use client";

import { useState } from "react";

type ParticipantSetupProps = {
  participants: string[];
  onChange: (participants: string[]) => void;
  onStart: () => void;
};

export function ParticipantSetup({ participants, onChange, onStart }: ParticipantSetupProps) {
  const [draft, setDraft] = useState("");

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
      <p className="intro">참가자를 등록하면 운전자부터 좌석, 방, 설거지까지 룰렛으로 정합니다.</p>
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
      <button className="primary-button" type="button" disabled={participants.length < 2} onClick={onStart}>게임 시작 <span>→</span></button>
      <p className="hint">최소 2명 · 이름을 눌러 삭제</p>
    </section>
  );
}
