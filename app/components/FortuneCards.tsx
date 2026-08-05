"use client";

import { FORTUNE_CARDS, type FortuneCardId } from "../lib/assignment";

type FortuneCardsProps = {
  available: FortuneCardId[];
  onUse: (cardId: FortuneCardId) => void;
};

export function FortuneCards({ available, onUse }: FortuneCardsProps) {
  return (
    <section className="fortune-panel" aria-label="운명 카드">
      <div className="panel-label">운명 카드 3장</div>
      <p className="fortune-hint">결과가 마음에 들지 않을 때 한 장을 사용하세요. 카드는 한 번만 쓸 수 있습니다.</p>
      <div className="fortune-card-list">
        {FORTUNE_CARDS.map((card) => {
          const enabled = available.includes(card.id);
          return (
            <button className={`fortune-card${enabled ? "" : " is-used"}`} type="button" key={card.id} disabled={!enabled} onClick={() => onUse(card.id)}>
              <strong>{card.label}</strong>
              <span>{enabled ? card.description : "사용 완료"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
