import assert from "node:assert/strict";
import test from "node:test";
import { getScrollRevealDelay, parseCustomRevealDelay } from "../src/lib/scroll-reveal";

test("scroll reveal staggers nearby cards and caps long grids", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map(getScrollRevealDelay), [0, 45, 90, 135, 180, 180]);
});

test("scroll reveal delay handles negative and invalid indexes", () => {
  assert.equal(getScrollRevealDelay(-3), 0);
  assert.equal(getScrollRevealDelay(Number.NaN), 0);
});

test("parseCustomRevealDelay parses valid numbers and clamps bounds", () => {
  assert.equal(parseCustomRevealDelay("120"), 120);
  assert.equal(parseCustomRevealDelay("600"), 360);
  assert.equal(parseCustomRevealDelay("-50", 10), 10);
  assert.equal(parseCustomRevealDelay("invalid", 20), 20);
  assert.equal(parseCustomRevealDelay(null, 0), 0);
});
