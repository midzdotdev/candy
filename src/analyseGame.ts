import { produce } from "limu";
import { CandyPosition } from "./types";
import { Tube } from "./useGame";

type GameEndState = "complete" | "stuck";

interface MovesGraph {
  states: Array<{
    tubes: Tube[];
    tubesHash: string;
    completeState: GameEndState | null;
  }>;

  moves: Array<{
    fromTubesHash: string;
    move: Move;
    toTubesHash: string;
  }>;
}

const hashTubes = (tubes: Tube[]) =>
  tubes.map((tube) => tube.join(",")).join(";");

const applyMove = (tubes: Tube[], move: Move): Tube[] =>
  produce(tubes, (draft) => {
    const { from, to } = move;

    const candy = draft[from.tubeIndex].pop();
    draft[to.tubeIndex].push(candy!);
  });

export interface Move {
  from: CandyPosition;
  to: CandyPosition;
}

/** Gives a directed cyclic graph of all moves in a game. */
export const getMovesGraphBFS = (tubes: Tube[]): MovesGraph => {
  const tubeCapacity = tubes[0].length;

  const graph: MovesGraph = {
    states: [],
    moves: [],
  };

  /**
   * Tracks the tube states which have been discovered.
   * Helped to prevent infinite loops on recursive moves.
   */
  const discoveredHashes = new Set<string>([hashTubes(tubes)]);

  /** The queue of tube states to process next. */
  const queuedTubes: Array<Tube[]> = [tubes];

  let currentTubes: Tube[] | undefined = undefined;

  while ((currentTubes = queuedTubes.pop())) {
    if (isGameComplete(currentTubes, tubeCapacity)) {
      graph.states.push({
        tubes: currentTubes,
        tubesHash: hashTubes(currentTubes),
        completeState: "complete",
      });

      console.log("complete");

      break;
    }

    const moves = getAvailableMoves(currentTubes, tubeCapacity);

    if (moves.length === 0) {
      graph.states.push({
        tubes: currentTubes,
        tubesHash: hashTubes(currentTubes),
        completeState: "stuck",
      });

      continue;
    }

    const currentTubesHash = hashTubes(currentTubes);

    graph.states.push({
      tubes: currentTubes,
      tubesHash: currentTubesHash,
      completeState: null,
    });

    for (const move of moves) {
      const toTubes = applyMove(currentTubes, move);
      const toTubesHash = hashTubes(toTubes);

      if (!discoveredHashes.has(toTubesHash)) {
        discoveredHashes.add(toTubesHash);

        queuedTubes.push(toTubes);
      }

      graph.moves.push({
        fromTubesHash: currentTubesHash,
        move,
        toTubesHash,
      });
    }
  }

  return graph;
};

export const getCompletionMovesPath = (graph: MovesGraph): Move[] => {
  if (!graph.states.find((state) => state.completeState === "complete"))
    return [];

  const moves: Move[] = [];

  let currentState = graph.states.find(
    (state) => state.completeState === "complete"
  );

  while (currentState) {
    const move = graph.moves.find(
      (move) => move.toTubesHash === currentState!.tubesHash
    );

    if (!move) break;

    moves.unshift(move.move);

    currentState = graph.states.find(
      (state) => state.tubesHash === move.fromTubesHash
    );
  }

  return moves;
};

export const canCompleteGame = (graph: MovesGraph): boolean =>
  graph.states.some((state) => state.completeState === "complete");

export const isGameComplete = (tubes: Tube[], tubeCapacity: number): boolean =>
  tubes
    // disregard empty tubes
    .filter((x) => x.length > 0)
    // check whether each tubes is filled with the same candy
    .every(
      (tube) =>
        tube.length === tubeCapacity && tube.every((sweet) => sweet === tube[0])
    );

export const getAvailableMoves = (
  tubes: Tube[],
  tubeCapacity: number
): Move[] => {
  const moves: Move[] = [];

  for (const [fromTubeIndex, fromTube] of tubes.entries()) {
    if (
      // skip if source tube is empty
      fromTube.length === 0 ||
      // if tube is complete
      (fromTube.length === tubeCapacity &&
        fromTube.every((x) => x === fromTube.at(0)))
    )
      continue;

    for (const [toTubeIndex, toTube] of tubes.entries()) {
      if (
        // skip if source and destination tubes are the same
        fromTubeIndex === toTubeIndex ||
        // skip if destination tube is full
        toTube.length === tubeCapacity ||
        // skip if destination tube has different uppermost candy
        (toTube.length !== 0 && toTube.at(-1) !== fromTube.at(-1))
      )
        continue;

      moves.push({
        from: { tubeIndex: fromTubeIndex, candyIndex: fromTube.length - 1 },
        to: { tubeIndex: toTubeIndex, candyIndex: toTube.length },
      });
    }
  }

  return moves;
};
