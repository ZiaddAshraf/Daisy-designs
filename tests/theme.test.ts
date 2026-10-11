import assert from "node:assert/strict";
import test from "node:test";
import { getNextTheme, resolveTheme } from "@/lib/theme";

test("saved theme takes precedence over the system color preference", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
});

test("first visit follows the system color preference", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});

test("invalid saved theme values are ignored", () => {
  assert.equal(resolveTheme("sepia", true), "dark");
  assert.equal(resolveTheme("", false), "light");
});

test("theme toggle switches between light and dark", () => {
  assert.equal(getNextTheme("light"), "dark");
  assert.equal(getNextTheme("dark"), "light");
});
