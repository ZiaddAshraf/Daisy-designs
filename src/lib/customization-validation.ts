import { normalizeCustomization } from "@/lib/commerce-rules";

type CustomizationFieldDefinition = {
    key: string;
    type: "TEXT" | "SELECT" | "COLOR" | "SIZE" | "IMAGE";
    required: boolean;
    maxLength: number | null;
    options: { value: string }[];
};

export type CustomizationValidation =
    | { success: true; data: Record<string, string> | undefined }
    | { success: false; reason: "INVALID_CUSTOMIZATION" | "UNSUPPORTED_CUSTOMIZATION" };

const choiceTypes = new Set(["SELECT", "COLOR", "SIZE"]);

export function validateCustomization(
    fields: CustomizationFieldDefinition[],
    input?: Record<string, string>,
): CustomizationValidation {
    const values = normalizeCustomization(input) ?? {};
    const knownKeys = new Set(fields.map(field => field.key));
    if (Object.keys(values).some(key => !knownKeys.has(key))) {
        return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }

    const validated: Record<string, string> = {};
    for (const field of fields) {
        const value = values[field.key];
        if (field.type === "IMAGE") {
            if (field.required) return { success: false, reason: "UNSUPPORTED_CUSTOMIZATION" };
            if (value) return { success: false, reason: "UNSUPPORTED_CUSTOMIZATION" };
            continue;
        }

        if (field.required && !value) return { success: false, reason: "INVALID_CUSTOMIZATION" };
        if (!value) continue;
        if (field.type === "TEXT") {
            if (field.maxLength !== null && value.length > field.maxLength) {
                return { success: false, reason: "INVALID_CUSTOMIZATION" };
            }
        } else if (choiceTypes.has(field.type) && !field.options.some(option => option.value === value)) {
            return { success: false, reason: "INVALID_CUSTOMIZATION" };
        }
        validated[field.key] = value;
    }

    return { success: true, data: Object.keys(validated).length ? validated : undefined };
}
