import assert from "node:assert/strict";
import test from "node:test";
import { getNextTheme, resolveTheme } from "@/lib/theme";

test("saved theme takes precedence over the default", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
});

test("first visit defaults to light mode", () => {
  assert.equal(resolveTheme(null, true), "light");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme(null), "light");
});

test("invalid saved theme values fallback to light mode", () => {
  assert.equal(resolveTheme("sepia", true), "light");
  assert.equal(resolveTheme("", false), "light");
});

test("theme toggle switches between light and dark", () => {
  assert.equal(getNextTheme("light"), "dark");
  assert.equal(getNextTheme("dark"), "light");
});
