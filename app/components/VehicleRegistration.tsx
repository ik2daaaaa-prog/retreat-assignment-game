"use client";

type VehicleRegistrationProps = {
  driverIds: string[];
  values: Record<string, string>;
  onChange: (driverId: string, label: string) => void;
  onContinue: () => void;
  error?: string;
};

export function VehicleRegistration({ driverIds, values, onChange, onContinue, error }: VehicleRegistrationProps) {
  const complete = driverIds.length > 0 && driverIds.every((driverId) => values[driverId]?.trim());
  return (
    <section className="game-card">
      <div className="section-kicker">ROUND 02 · VEHICLE CHECK-IN</div>
      <h2>운전자 차량을 입력하세요</h2>
      <p className="intro">차량 수에 맞춰 참가자를 최대한 같은 수로 나눕니다. 9명·3대라면 차량마다 3명, 경차는 항상 3명입니다.</p>
      <div className="vehicle-input-list">
        {driverIds.map((driverId, index) => <label className="vehicle-input-row" key={driverId}><span><b>DRIVER {String(index + 1).padStart(2, "0")}</b>{driverId}</span><input value={values[driverId] || ""} placeholder="예: 우리 카니발" aria-label={`${driverId} 차량명`} onChange={(event) => onChange(driverId, event.target.value)} /></label>)}
      </div>
      <div className="vehicle-rule"><b>좌석 규칙</b><span>경차 · 운전석 + 조수석 + 2열 좌측 (총 3명 고정)</span><span>카니발 · 운전석 + 조수석 + 2열 좌/우 + 3열 좌/우</span><span>일반 차량 · 운전석 + 조수석 + 2열 좌/우</span></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      <button className="primary-button" type="button" disabled={!complete} onClick={onContinue}>좌석 배정 시작 <span>→</span></button>
    </section>
  );
}
