import cluster from "cluster";
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
