import assert from "node:assert/strict";
import test from "node:test";
import {
  createSeatAssignments,
  createVehicle,
  driverSelectionComplete,
  normalizeDriverCount,
  passengerSeatIds,
  remainingParticipantIds,
  roomCandidateIds,
  selectRandom,
  validateCapacity,
} from "../app/lib/assignment.ts";

test("카니발은 3열 양쪽 좌석만 생성한다", () => {
  const vehicle = createVehicle("v1", "p1", "우리 카니발");
  assert.deepEqual(vehicle.seatIds, ["driver", "front-right", "row2-left", "row2-right", "row3-left", "row3-right"]);
  assert.deepEqual(passengerSeatIds(vehicle), ["front-right", "row2-left", "row2-right", "row3-left", "row3-right"]);
});

test("일반 차량은 2열 양쪽 좌석만 생성한다", () => {
  assert.deepEqual(createVehicle("v2", "p2", "쏘렌토").seatIds, ["driver", "front-right", "row2-left", "row2-right"]);
});

test("후보 제외, 결정적 추첨, 정원 부족을 계산한다", () => {
  assert.deepEqual(remainingParticipantIds(["p1", "p2", "p3"], ["p1", "p3"]), ["p2"]);
  assert.equal(selectRandom(["p1", "p2"], () => 0.99), "p2");
  assert.deepEqual(validateCapacity(9, [createVehicle("v1", "p1", "카니발")]), { valid: false, availableSeats: 5, missingSeats: 3 });
});

test("운전자는 운전석에 고정되고 남은 참가자만 좌석 후보가 된다", () => {
  const vehicle = createVehicle("v1", "p1", "카니발");
  const assignments = { ...createSeatAssignments(vehicle), "v1:front-right": "p2" };
  assert.deepEqual(createSeatAssignments(vehicle), { "v1:driver": "p1" });
  assert.deepEqual(remainingParticipantIds(["p1", "p2", "p3"], Object.values(assignments)), ["p3"]);
  assert.equal(passengerSeatIds(vehicle).includes("row3-right"), true);
});

test("방은 이미 배정된 사람을 제외하고 후보를 계산한다", () => {
  const all = ["p1", "p2", "p3"];
  assert.deepEqual(roomCandidateIds(all, { "room-a:0": "p1" }), ["p2", "p3"]);
});

test("운전자 수는 참가자 수 안에서 정규화되고 목표 수만큼 뽑아야 확정된다", () => {
  assert.equal(normalizeDriverCount(0, 5), 1);
  assert.equal(normalizeDriverCount(99, 5), 5);
  assert.equal(driverSelectionComplete(2, 3), false);
  assert.equal(driverSelectionComplete(3, 3), true);
});
