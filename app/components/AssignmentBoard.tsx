"use client";

import type { Assignment, SeatId, Vehicle } from "../lib/assignment";

const seatLabels: Record<SeatId, string> = { driver: "운전석", "front-right": "조수석", "row2-left": "2열 왼쪽", "row2-right": "2열 오른쪽", "row3-left": "3열 왼쪽", "row3-right": "3열 오른쪽" };

type AssignmentBoardProps = { vehicles: Vehicle[]; assignments: Assignment };

export function AssignmentBoard({ vehicles, assignments }: AssignmentBoardProps) {
  return <div className="vehicle-board">{vehicles.map((vehicle) => <article className="vehicle-result" key={vehicle.id}><div className="panel-label">{vehicle.label}</div>{vehicle.seatIds.map((seatId) => <div className="seat-row" key={seatId}><span>{seatLabels[seatId]}</span><strong>{assignments[`${vehicle.id}:${seatId}`] || "추첨 대기"}</strong></div>)}</article>)}</div>;
}
