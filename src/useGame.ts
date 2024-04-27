import { useCallback, useMemo, useState } from "react";
import { randomiseArray } from "./utils";
import { produce } from "limu";
import { isGameComplete } from "./analyseGame";

export type CandyValue = number;
export type Tube = CandyValue[];

const TUBE_CAPACITY = 4;
const CANDY_VARIANTS = 4;
const TUBE_START_COUNT = CANDY_VARIANTS + 2;

const makeRandomTubes = (): Tube[] => {
  const randomisedSweets = randomiseArray(
    Array.from(
      { length: CANDY_VARIANTS * TUBE_CAPACITY },
      (_, i) => i % CANDY_VARIANTS
    )
  );

  const tubes = Array.from({ length: TUBE_START_COUNT }, (_, i) =>
    randomisedSweets.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY)
  );

  return tubes;
};

export const canMove = ({
  tubes,
  tubeCapacity,
}: {
  tubes: Tube[];
  tubeCapacity: number;
}) =>
  tubes.some((tubeA, tubeAIndex) => {
    if (tubeA.length === 0) return false;

    return tubes.some((tubeB, tubeBIndex) => {
      if (tubeAIndex === tubeBIndex) return false;

      return (
        tubeB.length < tubeCapacity &&
        (tubeB.length === 0 || tubeB.at(-1) === tubeA.at(-1))
      );
    });
  });

export const useGame = (params: {
  onMove?: (
    from: {
      tubeIndex: number;
      candyIndex: number;
    },
    to: {
      tubeIndex: number;
      candyIndex: number;
    }
  ) => void;
}) => {
  const [tubes, setTubes] = useState(makeRandomTubes());
  const [tubeHistory, setTubeHistory] = useState<number[][][]>([]);
  const [selection, setSelection] = useState<{
    tubeIndex: number;
    count: number;
  } | null>(null);

  const canAddTube = tubes.length < TUBE_START_COUNT + 1;

  const addTube = useCallback(() => {
    if (!canAddTube) return;

    setTubes(produce((tubes) => tubes.push([])));
  }, [canAddTube]);

  const isComplete = useMemo(
    () => isGameComplete(tubes, TUBE_CAPACITY),
    [tubes]
  );

  const newGame = useCallback(() => {
    setTubes(makeRandomTubes());
    setTubeHistory([]);
    setSelection(null);
  }, []);

  const hasMovesAvailable = useMemo(
    () =>
      canMove({
        tubes,
        tubeCapacity: TUBE_CAPACITY,
      }),
    [tubes]
  );

  const onTubePress = useCallback(
    (tubeIndex: number) => {
      if (!hasMovesAvailable) return;

      // ignore invalid tube index
      if (tubeIndex < 0 || tubeIndex >= tubes.length) return;

      // if no tube is selected
      if (selection === null) {
        // if clicked tube is empty, ignore
        if (tubes[tubeIndex].length === 0) {
          return;
        }

        // if clicked tube is not empty, select it
        setSelection({
          tubeIndex,
          count: 1,
        });

        return;
      }

      // clicking the selected tube can select multiple candies
      if (tubeIndex === selection.tubeIndex) {
        const maxSelectionCount =
          tubes[selection.tubeIndex].length -
          1 -
          tubes[selection.tubeIndex].findLastIndex(
            (candy) => candy !== tubes[selection.tubeIndex].at(-1)
          );

        // if max number of candies are selected, deselect tube
        if (selection.count === maxSelectionCount) {
          setSelection(null);

          return;
        }

        setSelection({
          tubeIndex,
          count: selection.count + 1,
        });

        return;
      }

      // if
      //   clicked candy is different from the selected one, or
      //   clicked tube cannot hold selection
      // then select clicked tube
      if (
        (tubes[tubeIndex].length !== 0 &&
          tubes[tubeIndex].at(-1) !== tubes[selection.tubeIndex].at(-1)) ||
        TUBE_CAPACITY - tubes[tubeIndex].length < selection.count
      ) {
        setSelection({
          tubeIndex,
          count: 1,
        });

        return;
      }

      // otherwise happy path, move selection to clicked tube

      setTubeHistory((prevTubeHistory) => [...prevTubeHistory, tubes]);

      for (let i = 0; i < selection.count; i++) {
        params.onMove?.(
          {
            tubeIndex: selection.tubeIndex,
            candyIndex: tubes[selection.tubeIndex].length - i - 1,
          },
          {
            tubeIndex,
            candyIndex: tubes[tubeIndex].length + i,
          }
        );
      }

      setTubes(
        produce((tubes) => {
          for (let n = 0; n < selection.count; n++) {
            const sweet = tubes[selection.tubeIndex].pop();
            tubes[tubeIndex].push(sweet!);
          }
        })
      );

      setSelection(null);
    },
    [tubes, selection, params.onMove]
  );

  const isCandySelected = (tubeIndex: number, candyIndex: number) =>
    tubeIndex === selection?.tubeIndex &&
    candyIndex < tubes[tubeIndex].length &&
    candyIndex >= tubes[tubeIndex].length - selection.count;

  const canUndo = tubeHistory.length > 0;

  const undo = () => {
    if (tubeHistory.length === 0) return;

    setSelection(null);

    const prevTubes = tubeHistory.at(-1)!;

    const newTubeHistory = [
      ...tubeHistory
        .slice(0, -1)
        .map((tubes) => [...tubes.map((sweets) => [...sweets])]),
    ];

    setTubeHistory(newTubeHistory);
    setTubes(prevTubes);
  };

  return {
    isComplete,
    hasMovesAvailable,
    tubeCapacity: TUBE_CAPACITY,
    candyVariants: CANDY_VARIANTS,
    tubes,

    isCandySelected,
    selection,
    isTubeFull: useCallback(
      (tubeIndex: number) => tubes[tubeIndex].length === TUBE_CAPACITY,
      [tubes]
    ),
    onTubePress,
    newGame,

    canAddTube,
    addTube,

    canUndo,
    undo,
  };
};
