import { Cluster, Clusterer } from "k-medoids";
export interface TSPResult<T> {
  path: T[];
  weight: number;
}

export type DistanceFunction<T> = (a: T, b: T) => number;

function rotateArray<T>(a: T[], amount: number) {
  const removedValues = a.splice(0, amount + 1);
  a.push(...removedValues);
}

function greedyTSP<T extends {}>(
  nodes: T[],
  distanceFunction: DistanceFunction<T>
): TSPResult<T> {
  const newNodes = [...nodes];
  const result: T[] = [newNodes.pop() as T];
  const weights: number[] = [];
  while (newNodes.length > 0) {
    const lastNode: T = result[result.length - 1];
    const distances = newNodes.map((v, index) => ({
      node: index,
      distance: distanceFunction(v, lastNode),
    }));
    const nextCandidate = distances.reduce((p, c) =>
      p.distance < c.distance ? p : c
    );
    result.push(newNodes.splice(nextCandidate.node, 1)[0]);
    weights.push(nextCandidate.distance);
  }
  weights.push(distanceFunction(result[0], result[result.length - 1]));

  const worstWeight = weights.reduce(
    (p, c, index) => (p.distance > c ? p : { distance: c, index }),
    { distance: -1, index: -1 }
  ).index;
  rotateArray(weights, worstWeight);
  rotateArray(result, worstWeight);

  return {
    path: result,
    weight: weights.slice(0, weights.length - 1).reduce((a, b) => a + b),
  };
}

export function multiTSP<T extends {}>(
  nodes: T[],
  groups: number,
  options: {
    distanceFunction: DistanceFunction<T>;
    progressCallback?: () => TSPResult<T>;
    abortSignal?: AbortSignal;
  }
): TSPResult<T>[] {
  const clusterer = Clusterer.getInstance(
    nodes,
    groups,
    options.distanceFunction
  );
  const clusteredData = clusterer.getClusteredData();
  return clusteredData.map((v) => greedyTSP(v, options.distanceFunction));
}

export function fromTSP(
  distances: number[],
  weights: number[],
  segments: number,
  evaluate: (segments: { distance: number; weight: number }[]) => number
): { cuts: number[]; segmentWeight: number[]; segmentDistance: number[] } {
  const cutStack = [...new Array(segments + 1).keys()];
  const doCuts = (cuts: number[]) => {
    const getSegment = (segmentID: number) => {
      console.assert(segmentID < segments);
      if (segmentID === 0) {
        const d = [
          ...distances.slice(cuts[cuts.length - 1] + 1),
          ...distances.slice(0, cuts[0]),
        ];
        const w = [
          ...weights.slice(cuts[cuts.length - 1] + 1),
          ...weights.slice(0, cuts[0] + 1),
        ];
        return { distance: d, weight: w };
      } else {
        const d = distances.slice(cuts[segmentID] + 1, cuts[segmentID + 1]);
        const w = weights.slice(cuts[segmentID] + 1, cuts[segmentID + 1] + 1);

        return { distance: d, weight: w };
      }
    };
    return [...new Array(segments).keys()].map((v) => {
      const s = getSegment(v);
      return {
        distance: s.distance.reduce((a, b) => a + b, 0),
        weight: s.weight.reduce((a, b) => a + b, 0),
      };
    });
  };
  const incrementStack = () => {
    for (const index of [...cutStack.keys()].reverse()) {
      cutStack[index] += 1;
      if (cutStack[index] < distances.length) {
        [...cutStack.keys()]
          .slice(index + 1)
          .forEach((v, i) => (cutStack[v] = cutStack[index] + i));
        return true;
      }
    }
    return false;
  };
  let bestCut = [...cutStack];
  let bestCutPenalty = undefined;
  for (;;) {
    const c = doCuts(cutStack);
    const penalty = evaluate(c);
    if (bestCutPenalty === undefined || penalty < bestCutPenalty) {
      bestCut = [...cutStack];
      bestCutPenalty = penalty;
    }
    if (!incrementStack()) {
      const res = doCuts(bestCut);
      const segmentWeight = res.map((v) => v.weight);
      const segmentDistance = res.map((v) => v.distance);
      return { cuts: bestCut, segmentWeight, segmentDistance };
    }
  }
}
