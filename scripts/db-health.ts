import "dotenv/config";
import { checkDatabaseHealth } from "../src/lib/db-health";

checkDatabaseHealth()
    .then(healthy => { if (!healthy) throw new Error("Database health query returned an unexpected result"); console.log("Database health: OK"); })
    .catch(error => { console.error("Database health: FAILED", error); process.exitCode = 1; });