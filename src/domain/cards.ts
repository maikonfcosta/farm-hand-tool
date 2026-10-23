export const SUITS = [
  { id: 'menta', color: '#6FC7B0', numbers: [1, 3, 4, 5, 6] },
  { id: 'laranja', color: '#F28A4B', numbers: [2, 7] },
  { id: 'azul', color: '#5B8BD0', numbers: [1, 2, 3, 4, 5, 7] },
  { id: 'amarelo', color: '#F2B632', numbers: [1, 4, 7] },
  { id: 'lima', color: '#8CC63F', numbers: [2, 3, 5, 6] },
  { id: 'rosa', color: '#E5588F', numbers: [6] },
];
export const cardKeys = SUITS.flatMap((s) =>
  s.numbers.map((n) => `${s.id}-${n}`),
);
