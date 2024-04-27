import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const candyAppearances = ["emoji", "number", "ball"] as const;

export type CandyAppearance = (typeof candyAppearances)[number];

const candyAppearanceAtom = atomWithStorage<CandyAppearance>(
  "candyAppearance",
  candyAppearances[0]
);

export const useCandyAppearance = () => {
  const [candyAppearance, setCandyAppearance] = useAtom(candyAppearanceAtom);

  return {
    value: candyAppearance,
    toggle: () => {
      const currentIndex = candyAppearances.indexOf(candyAppearance);

      setCandyAppearance(
        candyAppearances[(currentIndex + 1) % candyAppearances.length]
      );
    },
  };
};
