import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import "./App.css";
import { useGame } from "./useGame";
import { candies } from "./constants";
import { CandyPosition, eqCandyPosition } from "./types";
import { updateArray, voidAsync, wait } from "./utils";
import { useCandyAppearance } from "./store";
import { Move, getMovesGraphBFS, getCompletionMovesPath } from "./analyseGame";

const clickTube = (tubeIndex: number) => {
  const tubeElement = document.getElementsByClassName("tube")?.[
    tubeIndex
  ] as HTMLElement;

  tubeElement.click();
};

function App() {
  const candyAppearance = useCandyAppearance();

  const [transitionalCandies, setTransitionalCandies] = useState<
    Array<
      Pick<
        React.ComponentProps<typeof TransitionalCandy>,
        "from" | "to" | "stackIndex" | "value"
      >
    >
  >([]);

  const isCandyAnimating = useCallback(
    (position: CandyPosition) =>
      transitionalCandies.some((x) =>
        typeof x.to === "object"
          ? eqCandyPosition(x.to, position)
          : eqCandyPosition(x.from, position)
      ),
    [transitionalCandies]
  );

  const game = useGame({
    onMove: (from, to) => {
      // move transitional candy to destination
      setTransitionalCandies((selectedCandies) => {
        const index = selectedCandies.findIndex((x) =>
          eqCandyPosition(x.from, from)
        );

        if (index === -1) return selectedCandies;

        selectedCandies[index].to = to;

        return selectedCandies;
      });
    },
  });

  // listen to keyboard events
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const digitKey = Number.isFinite(parseInt(e.key))
        ? parseInt(e.key)
        : null;

      if (digitKey !== null) {
        game.onTubePress(digitKey - 1);
        return;
      }

      if (e.key === "u") {
        game.canUndo && game.undo();
        return;
      }
    };

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, [game.onTubePress, game.canUndo, game.undo]);

  const showWinningMessage = useMemo(
    () => game.isComplete && transitionalCandies.length === 0,
    [game.isComplete, transitionalCandies.length]
  );

  // listen to game completion
  useLayoutEffect(() => {
    if (!showWinningMessage) return;

    alert("You win!");

    game.newGame();
  }, [showWinningMessage]);

  // update floating candies on selection change
  useEffect(() => {
    const desiredTransitionals: typeof transitionalCandies =
      game.selection === null
        ? []
        : Array.from({ length: game.selection.count }, (_, i) => ({
            value: game.tubes[game.selection!.tubeIndex].at(-1)!,
            stackIndex: i,
            from: {
              tubeIndex: game.selection!.tubeIndex,
              candyIndex: game.tubes[game.selection!.tubeIndex].length - i - 1,
            },
          }));

    setTransitionalCandies((transitionalCandies) =>
      updateArray({
        currentArray: transitionalCandies,
        desiredArray: desiredTransitionals,
        equals: (a, b) => eqCandyPosition(a.from, b.from),

        // leave existing transitionals as is
        onMatch: (currentItem) => [currentItem],

        // when added to selection, add as transitional
        onNew: (desiredItem) => [desiredItem],

        // when removed from selection, revert to original position
        onMissing: (currentItem) => {
          if (currentItem.to) return [currentItem];

          currentItem.to = "revert";

          return [currentItem];
        },
      })
    );
  }, [game.selection]);

  const onSolve = useCallback(() => {
    const movesGraph = getMovesGraphBFS(game.tubes);

    const moves = getCompletionMovesPath(movesGraph);

    if (moves.length === 0) return;

    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    Promise.resolve().then(async () => {
      await wait(1000);

      for (const move of moves) {
        await wait(300);

        clickTube(move.from.tubeIndex);

        await wait(300);

        clickTube(move.to.tubeIndex);
      }
    });
  }, [game.tubes]);

  // const onHint = useCallback(() => {
  //   const movesGraph = getMovesGraphBFS(game.tubes);

  //   const moves = getMovesToCompleteGame(movesGraph);

  //   if (moves.length === 0) return;

  //   const move = moves[0];

  //   clickTube(move.from.tubeIndex);

  //   setTimeout(() => {
  //     clickTube(move.to.tubeIndex);
  //   }, 1000);
  // }, [game.tubes]);

  return (
    <>
      <div
        style={{
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <p
          style={{
            visibility: game.hasMovesAvailable ? "hidden" : "visible",
            color: "red",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          NO MOVES LEFT
        </p>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            rowGap: "50px",
            columnGap: "15px",
          }}
        >
          {transitionalCandies.map((x, i) => (
            <TransitionalCandy
              key={`${x.from.tubeIndex}-${x.from.candyIndex}-${x.value}`}
              stackIndex={x.stackIndex}
              stackCount={transitionalCandies.length}
              from={x.from}
              to={x.to}
              value={x.value}
              onMovementFinished={() =>
                setTransitionalCandies((selectedCandies) =>
                  selectedCandies.filter(
                    (selectedCandy) =>
                      selectedCandy.from.tubeIndex !== x.from.tubeIndex ||
                      selectedCandy.from.candyIndex !== x.from.candyIndex
                  )
                )
              }
            />
          ))}

          {game.tubes.map((tube, tubeIndex) => (
            <Tube
              key={tubeIndex}
              capacity={game.tubeCapacity}
              disabled={!game.hasMovesAvailable}
              isCandyHidden={(candyIndex) =>
                isCandyAnimating({ tubeIndex, candyIndex })
              }
              tubeIndex={tubeIndex}
              value={tube}
              onTubePress={() => game.onTubePress(tubeIndex)}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "center",
          }}
        >
          <button disabled={!game.canUndo} onClick={() => game.undo()}>
            Undo
          </button>

          <button onClick={() => game.newGame()}>New Game</button>

          <button disabled={!game.canAddTube} onClick={() => game.addTube()}>
            Add Tube
          </button>

          <button onClick={() => candyAppearance.toggle()}>
            Toggle Appearance
          </button>

          <button onClick={onSolve}>Solve</button>
        </div>
      </div>
    </>
  );
}

const Tube = (props: {
  tubeIndex: number;
  onTubePress: () => void;
  isCandyHidden: (candyIndex: number) => boolean;
  disabled: boolean;
  capacity: number;
  value: number[];
}) => {
  // highlight the last sequential candies
  const highlightIndexes = useMemo(() => {
    const indexes: number[] = [];

    for (let i = props.value.length - 1; i >= 0; i--) {
      if (props.value[i] !== props.value[props.value.length - 1]) break;

      indexes.push(i);
    }

    return indexes;
  }, [props.value]);

  return (
    <div
      key={props.tubeIndex}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
      }}
    >
      <div
        className="tube"
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          borderTop: "none",
          borderBottomRightRadius: "99999px",
          borderBottomLeftRadius: "99999px",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "5px",
          gap: "5px",
          cursor: !props.disabled ? "pointer" : "disabled",
          boxShadow:
            props.value.length === props.capacity &&
            props.value.every((x, _, [value]) => x === value)
              ? ["3px 3px 3px #0f0", "-3px 3px 3px #0f0"].join(",")
              : ["3px 3px 3px #888", "-3px 3px 3px #888"].join(","),
          transition: "all 0.2s ease-in-out",
        }}
        onClick={() => !props.disabled && props.onTubePress()}
      >
        {Array.from({ length: props.capacity }, (_, candyIndex) => (
          <Candy
            key={candyIndex}
            value={
              !props.isCandyHidden(candyIndex)
                ? props.value[candyIndex]
                : undefined
            }
            style={{
              opacity: highlightIndexes.includes(candyIndex) ? 1 : 0.7,
              transition: "opacity 0.2s ease-in-out",
            }}
          />
        ))}
      </div>

      {props.tubeIndex + 1}
    </div>
  );
};

const floatingStackOffset = {
  top: 5,
  left: 2,
};

const floatingCandyTxDuration = 100;
const stackTxDurationOffset = 100;

const getCandyOffset = (position: CandyPosition) => {
  const el = document.getElementsByClassName("tube")?.[position.tubeIndex]
    .children[position.candyIndex] as HTMLElement;

  return {
    top: `${el.offsetTop}px`,
    left: `${el.offsetLeft}px`,
  };
};

const getFloatingCandyOffset = (stackIndex: number, tubeIndex: number) => {
  const tubeElement = document.getElementsByClassName("tube")?.[
    tubeIndex
  ] as HTMLElement;
  const candyElement = tubeElement.children[0] as HTMLElement;

  const offset =
    stackIndex === 0
      ? {
          top: 0,
          left: 0,
        }
      : {
          top: (Math.random() > 0.5 ? -1 : 1) * (Math.random() * 10 + 5),
          left: (Math.random() > 0.5 ? -1 : 1) * (Math.random() * 10 + 5),
        };

  return {
    top: `${tubeElement.offsetTop - 50 + offset.top}px`,
    left: `${candyElement.offsetLeft + offset.left}px`,
  };
};

const TransitionalCandy = (props: {
  stackIndex: number;
  stackCount: number;
  value: number;
  from: CandyPosition;
  to?: "revert" | CandyPosition;
  onMovementFinished?: () => void;
}) => {
  const [position, setPosition] = useState(getCandyOffset(props.from));

  // animate to floating position after initial render
  useLayoutEffect(() => {
    setPosition(getFloatingCandyOffset(props.stackIndex, props.from.tubeIndex));
  }, []);

  // animate to `to` position once set
  useLayoutEffect(
    voidAsync(async () => {
      if (!props.to) return;

      if (props.to === "revert") {
        await wait(
          stackTxDurationOffset * (props.stackCount - props.stackIndex - 1)
        );

        setPosition(getCandyOffset(props.from));
        await wait(floatingCandyTxDuration);

        props.onMovementFinished?.();

        return;
      }

      // move to float above destination tube
      setPosition(getFloatingCandyOffset(0, props.to.tubeIndex));
      await wait(floatingCandyTxDuration);

      await wait(stackTxDurationOffset * props.stackIndex);

      // then move to destination candy
      setPosition(getCandyOffset(props.to as CandyPosition));
      await wait(floatingCandyTxDuration);

      props.onMovementFinished?.();
    }),
    [props.to]
  );

  return (
    <Candy
      value={props.value}
      style={{
        position: "absolute",
        transition: `all ${floatingCandyTxDuration}ms linear`,
        zIndex: 100 - props.stackIndex,
        ...position,
      }}
    />
  );
};

const Candy = (
  props: {
    value?: number;
    style?: CSSProperties;
  } & React.ComponentProps<"div">
) => {
  const candyAppearance = useCandyAppearance();

  const commonStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "45px",
    height: "45px",
    lineHeight: 0,
    borderRadius: "9999999px",
    visibility: typeof props.value === "number" ? "visible" : "hidden",
    ...props.style,
  };

  if (typeof props.value !== "number") {
    return <div {...props} style={commonStyles} />;
  }

  const c = candies[props.value];

  const appearanceStyle: CSSProperties =
    candyAppearance.value === "emoji"
      ? {
          fontSize: "35px",
        }
      : {
          backgroundColor: c.color,
          fontWeight: "bold",
          fontSize: "20px",
          boxShadow: "inset -5px -5px 9px hsl(0 0% 0% / 0.5)",
          color: c.labelColor,
        };

  return (
    <div
      {...props}
      style={{
        ...appearanceStyle,
        ...commonStyles,
      }}
    >
      {
        {
          emoji: c.emoji,
          number: props.value,
          ball: null,
        }[candyAppearance.value]
      }
    </div>
  );
};

export default App;
