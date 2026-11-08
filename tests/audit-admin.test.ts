import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { prisma } from "../src/lib/prisma";
import { isAdmin } from "../src/lib/admin-auth";

test("admin authorization denies anonymous, customers and stale admin tokens", async () => {
  const require = createRequire(import.meta.url);
  let session: { user: { id: string; role: string } } | null = null;
  let role = "ADMIN";
  const auth = mock.method(require("next-auth/next"), "getServerSession", async () => session);
  const originalFind = prisma.user.findUnique;
  prisma.user.findUnique = (async () => ({ role })) as unknown as typeof prisma.user.findUnique;
  try {
    assert.equal(await isAdmin(), false);
    session = { user: { id: "synthetic", role: "CUSTOMER" } }; assert.equal(await isAdmin(), false);
    session.user.role = "ADMIN"; assert.equal(await isAdmin(), true);
    role = "CUSTOMER"; assert.equal(await isAdmin(), false);
  } finally { auth.mock.restore(); prisma.user.findUnique = originalFind; }
});
