// Runs before test imports: never silently load the application's production DB.
process.env.NODE_ENV = "test";
if (process.env.RUN_DATABASE_TESTS === "true") {
  const target = new URL(process.env.DATABASE_URL || "invalid:");
  if (process.env.TEST_DATABASE_CONFIRMATION !== "ISOLATED_DISPOSABLE" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
      !/^\/[a-z0-9_]*_test$/.test(target.pathname)) {
    throw new Error("Database tests require an explicitly confirmed disposable loopback database ending in _test");
  }
} else {
  process.env.DATABASE_URL = "postgresql://audit:audit@127.0.0.1:1/daisy_test?connect_timeout=1";
}
delete process.env.SHADOW_DATABASE_URL;
delete process.env.RESEND_API_KEY;
process.env.NEXTAUTH_SECRET = "synthetic-unit-test-secret-only";
process.env.NEXTAUTH_URL = "http://127.0.0.1:3107";
