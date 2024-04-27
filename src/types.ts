export interface CandyPosition {
  tubeIndex: number;
  candyIndex: number;
}

export const eqCandyPosition = (a: CandyPosition, b: CandyPosition) =>
  a.tubeIndex === b.tubeIndex && a.candyIndex === b.candyIndex;
