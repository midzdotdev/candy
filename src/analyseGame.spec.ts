import { describe, expect, test } from "vitest";
import { getAvailableMoves, getMovesGraphBFS } from "./analyseGame";

describe(`${getMovesGraphBFS.name}()`, () => {
  test("1", () => {
    const tubes = [[1, 2], [2, 1], []];

    const result = getMovesGraphBFS(tubes);

    expect(result).toMatchInlineSnapshot(`
      {
        "moves": [
          {
            "fromTubesHash": "1,2;2,1;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "1;2,1;2",
          },
          {
            "fromTubesHash": "1,2;2,1;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "1,2;2;1",
          },
          {
            "fromTubesHash": "1;2,1;2",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "1,1;2;2",
          },
          {
            "fromTubesHash": "1,2;2;1",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "1;2,2;1",
          },
          {
            "fromTubesHash": "1,1;2;2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "1,1;;2,2",
          },
          {
            "fromTubesHash": "1,1;2;2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "1,1;2,2;",
          },
          {
            "fromTubesHash": "1;2,2;1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": ";2,2;1,1",
          },
          {
            "fromTubesHash": "1;2,2;1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "1,1;2,2;",
          },
          {
            "fromTubesHash": "1,1;;2,2",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "1;1;2,2",
          },
          {
            "fromTubesHash": "1,1;;2,2",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "1,1;2;2",
          },
          {
            "fromTubesHash": "1,1;2,2;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "1;2,2;1",
          },
          {
            "fromTubesHash": "1,1;2,2;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "1,1;2;2",
          },
          {
            "fromTubesHash": ";2,2;1,1",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "2;2;1,1",
          },
          {
            "fromTubesHash": ";2,2;1,1",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "1;2,2;1",
          },
          {
            "fromTubesHash": "1;1;2,2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": ";1,1;2,2",
          },
          {
            "fromTubesHash": "1;1;2,2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "1,1;;2,2",
          },
          {
            "fromTubesHash": "2;2;1,1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": ";2,2;1,1",
          },
          {
            "fromTubesHash": "2;2;1,1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "2,2;;1,1",
          },
          {
            "fromTubesHash": ";1,1;2,2",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "1;1;2,2",
          },
          {
            "fromTubesHash": ";1,1;2,2",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "2;1,1;2",
          },
          {
            "fromTubesHash": "2,2;;1,1",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "2;2;1,1",
          },
          {
            "fromTubesHash": "2,2;;1,1",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "2,2;1;1",
          },
          {
            "fromTubesHash": "2;1,1;2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": ";1,1;2,2",
          },
          {
            "fromTubesHash": "2;1,1;2",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
            },
            "toTubesHash": "2,2;1,1;",
          },
          {
            "fromTubesHash": "2,2;1;1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "2,2;;1,1",
          },
          {
            "fromTubesHash": "2,2;1;1",
            "move": {
              "from": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
              "to": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
            },
            "toTubesHash": "2,2;1,1;",
          },
          {
            "fromTubesHash": "2,2;1,1;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 0,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "2;1,1;2",
          },
          {
            "fromTubesHash": "2,2;1,1;",
            "move": {
              "from": {
                "candyIndex": 1,
                "tubeIndex": 1,
              },
              "to": {
                "candyIndex": 0,
                "tubeIndex": 2,
              },
            },
            "toTubesHash": "2,2;1;1",
          },
        ],
        "states": [],
      }
    `);
  });
});

describe(`${getAvailableMoves.name}()`, () => {
  describe("no available moves", () => {
    test("when tubes are full", () => {
      const tubes = [
        [1, 2],
        [1, 2],
      ];
      const tubeCapacity = 2;

      const result = getAvailableMoves(tubes, tubeCapacity);

      expect(result).toStrictEqual([]);
    });

    test("when tubes uppermost candies are different", () => {
      const tubes = [
        [1, 1],
        [2, 2],
      ];
      const tubeCapacity = 1;

      const result = getAvailableMoves(tubes, tubeCapacity);

      expect(result).toStrictEqual([]);
    });
  });

  describe("available moves", () => {
    test("when a tube is empty", () => {
      const tubes = [[1], [2], []];
      const tubeCapacity = 2;

      const result = getAvailableMoves(tubes, tubeCapacity);

      expect(result).toStrictEqual([
        {
          from: { tubeIndex: 0, candyIndex: 0 },
          to: { tubeIndex: 2, candyIndex: 0 },
        },
        {
          from: { tubeIndex: 1, candyIndex: 0 },
          to: { tubeIndex: 2, candyIndex: 0 },
        },
      ]);
    });

    test("when a partially filled tube shares the same candy as a filled tube", () => {
      const tubes = [[1], [2, 1], [2]];
      const tubeCapacity = 2;

      const result = getAvailableMoves(tubes, tubeCapacity);

      expect(result).toStrictEqual([
        {
          from: { tubeIndex: 1, candyIndex: 1 },
          to: { tubeIndex: 0, candyIndex: 1 },
        },
      ]);
    });
  });
});
