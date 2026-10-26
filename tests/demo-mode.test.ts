import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_MODE_CONFIRMATION, isDemoModeEnabled, shouldBlockDemoTransactions } from "../src/lib/demo-mode";

test("demo mode is disabled unless production and both explicit opt-ins are present", () => {
  assert.equal(isDemoModeEnabled({ NODE_ENV: "production" }), false);
  assert.equal(isDemoModeEnabled({ NODE_ENV: "production", DEMO_MODE: "true", DEMO_MODE_CONFIRMATION }), false);
  assert.equal(isDemoModeEnabled({ NODE_ENV: "production", DEMO_MODE: "preview" }), false);
  assert.equal(isDemoModeEnabled({ NODE_ENV: "development", DEMO_MODE: "preview", DEMO_MODE_CONFIRMATION }), false);
  assert.equal(isDemoModeEnabled({ NODE_ENV: "production", DEMO_MODE: "preview", DEMO_MODE_CONFIRMATION }), true);
});

test("demo mode blocks every transaction and demo products stay blocked outside demo mode", () => {
  assert.equal(shouldBlockDemoTransactions(true), true);
  assert.equal(shouldBlockDemoTransactions(false, true), true);
  assert.equal(shouldBlockDemoTransactions(false, false), false);
});
