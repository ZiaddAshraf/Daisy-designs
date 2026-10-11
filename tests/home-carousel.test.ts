import assert from "node:assert/strict";
import test from "node:test";
import { getCarouselScrollDelta } from "../src/lib/home-carousel";

test("carousel next and previous follow logical direction in RTL and LTR", () => {
  assert.equal(getCarouselScrollDelta("rtl", "next", 1000), -820);
  assert.equal(getCarouselScrollDelta("rtl", "previous", 1000), 820);
  assert.equal(getCarouselScrollDelta("ltr", "next", 1000), 820);
  assert.equal(getCarouselScrollDelta("ltr", "previous", 1000), -820);
});

test("carousel scroll distance is safe for unusable viewport widths", () => {
  assert.equal(getCarouselScrollDelta("rtl", "next", 0), 0);
  assert.equal(getCarouselScrollDelta("rtl", "next", Number.NaN), 0);
});
