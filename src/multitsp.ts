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

// cuts[x] = 0 means to cut between the first and second element. Cut the first edge so to speak
export function cutIntoSegments<T>(cuts: number[], stream: T[]): T[][] {
  const segments = [...new Array(cuts.length - 1).keys()].map(
    (segmentIndex) => {
      const a = stream.slice(
        cuts[segmentIndex] + 1,
        cuts[segmentIndex + 1] + 1
      );
      return a;
    }
  );
  segments.push([
    ...stream.slice(cuts[cuts.length - 1] + 1),
    ...stream.slice(0, cuts[0] + 1),
  ]);
  return segments;
}

export function fromTSP(
  distances: number[],
  weights: number[],
  segments: number,
  evaluate: (segments: { distance: number; weight: number }[]) => number
): { cuts: number[]; segmentWeight: number[]; segmentDistance: number[] } {
  const cutStack = [...new Array(segments).keys()];
  const doCuts = (cuts: number[]) => {
    const weightSegments = cutIntoSegments(cuts, weights);
    const distanceSegments = cutIntoSegments(cuts, distances).map((v) =>
      v.slice(1)
    );
    return [...new Array(segments).keys()].map((v) => {
      return {
        distance: distanceSegments[v].reduce((a, b) => a + b, 0),
        weight: weightSegments[v].reduce((a, b) => a + b, 0),
      };
    });
  };
  const incrementStack = (cuts: number[], maxIndex: number) => {
    let rightDelta = 0;
    for (const index of [...cuts.keys()].reverse()) {
      cuts[index] += 1;
      if (cuts[index] < maxIndex - rightDelta) {
        [...cuts.keys()]
          .slice(index + 1)
          .forEach((v, i) => (cuts[v] = cuts[index] + i + 1));
        return true;
      }
      rightDelta += 1;
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
    if (!incrementStack(cutStack, distances.length - 1)) {
      const res = doCuts(bestCut);
      const segmentWeight = res.map((v) => v.weight);
      const segmentDistance = res.map((v) => v.distance);
      return { cuts: bestCut, segmentWeight, segmentDistance };
    }
  }
}
