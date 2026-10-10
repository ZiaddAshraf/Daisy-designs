export type PaymentRequest = { orderNumber: string; amount: number; customerEmail?: string };
export type PaymentResult = { status: "PENDING" | "PAID" | "FAILED"; reference?: string };

export interface PaymentProvider {
    readonly method: "COD" | "STRIPE" | "PAYMOB" | "FAWRY";
    createPayment(request: PaymentRequest): Promise<PaymentResult>;
}

export class CashOnDeliveryProvider implements PaymentProvider {
    readonly method = "COD" as const;
    async createPayment(_request: PaymentRequest): Promise<PaymentResult> { void _request; return { status: "PENDING" }; }
}

export class StripeProvider implements PaymentProvider {
    readonly method = "STRIPE" as const;
    async createPayment(_request: PaymentRequest): Promise<PaymentResult> { void _request; throw new Error("Stripe is not configured"); }
}

export class PaymobProvider implements PaymentProvider {
    readonly method = "PAYMOB" as const;
    async createPayment(_request: PaymentRequest): Promise<PaymentResult> { void _request; throw new Error("Paymob is not configured"); }
}

export class FawryProvider implements PaymentProvider {
    readonly method = "FAWRY" as const;
    async createPayment(_request: PaymentRequest): Promise<PaymentResult> { void _request; throw new Error("Fawry is not configured"); }
}
