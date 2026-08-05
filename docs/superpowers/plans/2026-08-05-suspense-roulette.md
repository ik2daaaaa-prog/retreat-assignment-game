# 긴장감 강화 룰렛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 배정 흐름에 생존자 운전자 룰렛, 좌석 카운트다운, 운명 카드 3장을 추가한다.

**Architecture:** 순수 게임 규칙은 `app/lib/assignment.ts`에 두고, 룰렛 시간 연출은 `Roulette` 컴포넌트에서 관리한다. 페이지는 카드와 카운트다운 상태를 localStorage에 함께 저장하며, 별도 `FortuneCards` 컴포넌트로 카드 UI를 분리한다.

**Tech Stack:** Next.js/React 19, TypeScript, Node test runner, Vinext.

## Global Constraints

- 기존 차량별 좌석 규칙과 방 배정 흐름을 유지한다.
- 카드는 새 게임마다 3장으로 초기화되고 한 번 사용하면 재사용하지 않는다.
- 기존 서버 렌더 및 순수 로직 테스트를 계속 통과해야 한다.

### Task 1: 운명 카드 규칙과 테스트

**Files:** `app/lib/assignment.ts`, `tests/assignment.test.mjs`

- [ ] 운명 카드 타입, 초기 덱 생성, 카드 제거 헬퍼를 추가한다.
- [ ] `driverSwap`, `seatProtect`, `reroll` 카드가 중복 없이 생성되고 사용 후 제거되는 테스트를 작성한다.
- [ ] 테스트를 실행해 실패를 확인한 뒤 최소 구현으로 통과시킨다.

### Task 2: 운명 카드 UI

**Files:** `app/components/FortuneCards.tsx`, `app/globals.css`

- [ ] 사용 가능한 카드 목록과 사용 버튼을 표시한다.
- [ ] 비활성화 상태와 카드 사용 결과 문구를 텍스트로 제공한다.
- [ ] 모바일에서 카드가 세로로 쌓이도록 스타일을 추가한다.

### Task 3: 룰렛 연출 강화

**Files:** `app/components/Roulette.tsx`, `app/globals.css`

- [ ] `countdownSeconds` 옵션을 추가하고 스핀 중 남은 초를 표시한다.
- [ ] 운전자 단계는 `survival` 스타일 문구와 라운드 정보를 표시한다.
- [ ] 좌석 단계는 10초 카운트다운이 끝난 뒤 결과를 확정한다.
- [ ] 타이머와 인터벌을 unmount 시 정리한다.

### Task 4: 페이지 상태 연결

**Files:** `app/page.tsx`

- [ ] 카드 덱, 사용 카드, 보호 대상, 룰렛 재실행 키를 상태와 localStorage에 연결한다.
- [ ] 운전자 교체 카드는 마지막 운전자와 후보를 교환한다.
- [ ] 자리 보호 카드는 다음 좌석 배정에서 보호 대상을 우선 확정한다.
- [ ] 한 번 더 카드는 룰렛 키를 증가시켜 현재 단계의 결과를 다시 시도한다.
- [ ] 운전자 결과 패널과 좌석 화면에 긴장도·카운트다운·카드 UI를 배치한다.

### Task 5: 검증 및 커밋

**Files:** `tests/rendered-html.test.mjs`, `app/page.tsx`

- [ ] 서버 HTML에 카드 문구와 카운트다운 텍스트가 포함되는지 검증한다.
- [ ] `npm test`와 `npm run lint`를 실행한다.
- [ ] 변경 사항을 기능별 커밋으로 저장한다.
