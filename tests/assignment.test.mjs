import assert from "node:assert/strict";
import test from "node:test";
import {
  createVehicle,
  passengerSeatIds,
  remainingParticipantIds,
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
