# 핀볼 배정 게임 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 운전자·좌석·방 추첨을 참가자 이름 공이 핀볼 보드를 통과해 슬롯에 들어가는 방식으로 변경한다.

**Architecture:** `PinballBoard`는 후보 목록과 완료 콜백만 받는 독립 클라이언트 컴포넌트다. 실제 당첨자는 기존 `selectRandom`으로 결정하고, CSS 애니메이션은 결과 공개 전의 시각적 연출을 담당한다. 기존 카드·저장·좌석 규칙은 페이지에서 그대로 재사용한다.

**Tech Stack:** React 19, TypeScript, CSS animations, Node test runner.

## Global Constraints

- 운전자 수, 차량 좌석 구조, 방 정원 검증은 변경하지 않는다.
- 핀볼 공이 멈춘 슬롯의 결과를 텍스트로도 항상 표시한다.
- 애니메이션 타이머는 컴포넌트 해제 시 정리한다.

### Task 1: PinballBoard 컴포넌트

- 후보 이름을 공 라벨로 표시하고, 범퍼·레일·결과 슬롯을 렌더링한다.
- 시작 버튼을 누르면 2.4초 동안 공이 튕기는 애니메이션을 재생한 뒤 한 후보를 콜백한다.
- 후보가 없거나 진행 중이면 버튼을 비활성화한다.

### Task 2: 페이지 연결과 스타일

- 운전자·좌석·방 단계의 `Roulette`를 `PinballBoard`로 교체한다.
- 단계별 안내 문구를 핀볼 용어로 바꾸고 기존 카드는 유지한다.
- 반응형 핀볼 보드와 범퍼 스타일을 추가한다.

### Task 3: 검증

- 서버 HTML에 핀볼 보드 문구가 포함되는지 테스트한다.
- 순수 로직 테스트, 빌드, 린트를 실행하고 커밋한다.
