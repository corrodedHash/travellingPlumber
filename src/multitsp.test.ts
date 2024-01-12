import { describe, expect, test, it } from "vitest";
import { cutIntoSegments } from "./multitsp";

describe("cutSegments", () => {
  it("does basic cutting", () => {
    const segmented = cutIntoSegments([0, 3, 4], [1, 2, 3, 4, 5, 6]);
    expect(segmented).to.deep.equal([[2, 3, 4], [5], [6, 1]]);
  });
});
