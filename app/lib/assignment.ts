export type SeatId =
  | "driver"
  | "front-right"
  | "row2-left"
  | "row2-right"
  | "row3-left"
  | "row3-right";

export type Phase = "setup" | "drivers" | "vehicles" | "seats" | "roomSetup" | "rooms" | "summary";
export type Vehicle = { id: string; driverId: string; label: string; seatIds: SeatId[] };
export type Assignment = Record<string, string>;

const CARNIVAL_SEATS: SeatId[] = ["driver", "front-right", "row2-left", "row2-right", "row3-left", "row3-right"];
const STANDARD_SEATS: SeatId[] = ["driver", "front-right", "row2-left", "row2-right"];
const COMPACT_SEATS: SeatId[] = ["driver", "front-right", "row2-left"];

export function createVehicle(id: string, driverId: string, label: string): Vehicle {
  const cleanLabel = label.trim();
  const isCarnival = /카니발/i.test(cleanLabel);
  const isCompact = /경차|레이|모닝|스파크|캐스퍼/i.test(cleanLabel);
  return { id, driverId, label: cleanLabel, seatIds: isCompact ? COMPACT_SEATS : isCarnival ? CARNIVAL_SEATS : STANDARD_SEATS };
}

export function balanceVehicleSeats(vehicles: Vehicle[], participantCount: number): Vehicle[] {
  if (!vehicles.length) return vehicles;
  const targetCapacity = Math.max(1, Math.ceil(participantCount / vehicles.length));
  return vehicles.map((vehicle) => {
    if (vehicle.seatIds.length === COMPACT_SEATS.length) return vehicle;
    return { ...vehicle, seatIds: vehicle.seatIds.slice(0, Math.min(vehicle.seatIds.length, targetCapacity)) };
  });
}

export function passengerSeatIds(vehicle: Vehicle): SeatId[] {
  return vehicle.seatIds.filter((seatId) => seatId !== "driver");
}

export function createSeatAssignments(vehicle: Vehicle): Assignment {
  return { [`${vehicle.id}:driver`]: vehicle.driverId };
}

export function remainingParticipantIds(ids: string[], excluded: string[]): string[] {
  const excludedSet = new Set(excluded);
  return ids.filter((id) => !excludedSet.has(id));
}

export function selectRandom<T>(items: T[], random = Math.random): T | null {
  return items.length > 0 ? items[Math.floor(random() * items.length)] : null;
}

export function validateCapacity(participantCount: number, vehicles: Vehicle[]) {
  const availableSeats = vehicles.reduce((total, vehicle) => total + passengerSeatIds(vehicle).length, 0);
  const passengerCount = Math.max(0, participantCount - vehicles.length);
  const missingSeats = Math.max(0, passengerCount - availableSeats);
  return { valid: missingSeats === 0, availableSeats, missingSeats };
}

export function roomCandidateIds(participantIds: string[], roomAssignments: Assignment): string[] {
  return remainingParticipantIds(participantIds, Object.values(roomAssignments));
}

export function normalizeDriverCount(value: number, participantCount: number): number {
  if (participantCount <= 0) return 0;
  return Math.min(participantCount, Math.max(1, Math.floor(Number.isFinite(value) ? value : 1)));
}

export function driverSelectionComplete(selectedCount: number, targetCount: number): boolean {
  return targetCount > 0 && selectedCount === targetCount;
}

export function resetGamePhase(): Phase {
  return "setup";
}

export function firstArrival<T extends { arrival: number }>(items: T[]): T | null {
  return items.reduce<T | null>((winner, item) => winner === null || item.arrival < winner.arrival ? item : winner, null);
}

export type LadderRung = { row: number; column: number };

export function ladderDestination(startColumn: number, rungs: LadderRung[], columnCount: number): number {
  let column = Math.max(0, Math.min(columnCount - 1, startColumn));
  for (const rung of [...rungs].sort((a, b) => a.row - b.row)) {
    if (rung.column === column) column += 1;
    else if (rung.column === column - 1) column -= 1;
  }
  return column;
}
