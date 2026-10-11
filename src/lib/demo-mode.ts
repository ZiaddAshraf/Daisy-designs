export const DEMO_MODE_CONFIRMATION = "FICTIONAL_CATALOG_NOT_FOR_SALE";

export type DemoModeEnvironment = {
  NODE_ENV?: string;
  DEMO_MODE?: string;
  DEMO_MODE_CONFIRMATION?: string;
};

/** Requires a deliberate production-only opt-in plus a second confirmation value. */
export function isDemoModeEnabled(environment: DemoModeEnvironment = process.env): boolean {
  return environment.NODE_ENV === "production" &&
    environment.DEMO_MODE === "preview" &&
    environment.DEMO_MODE_CONFIRMATION === DEMO_MODE_CONFIRMATION;
}

export function shouldBlockDemoTransactions(demoMode: boolean, containsDemoProduct = false): boolean {
  return demoMode || containsDemoProduct;
}
