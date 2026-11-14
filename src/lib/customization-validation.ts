import { normalizeCustomization } from "@/lib/commerce-rules";
import stickersData from "@/data/stickers-product.json";
import { STICKER_PACKAGE_COUNTS, initialStickerMix, parseStickerMix, serializeStickerMix } from "@/lib/sticker-package-mix";

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

export function validateEgyptianPhone(phone: string): boolean {
    const cleaned = phone
        .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
        .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
        .replace(/[\s-]/g, "");
    return /^(?:(?:\+|00)?20|0)?1[0125]\d{8}$/.test(cleaned);
}

export function validateCustomization(
    fields: CustomizationFieldDefinition[],
    input?: Record<string, string>,
): CustomizationValidation {
    const values = normalizeCustomization(input) ?? {};
    const knownKeys = new Set([
        ...fields.map(field => field.key),
        "child_name",
        "parent_phone",
        "custom_design_text",
        "school_name",
        "grade",
        "class_name",
        "child_photo",
    ]);
    if (Object.keys(values).some(key => !knownKeys.has(key))) {
        return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }

    const validated: Record<string, string> = {};
    for (const field of fields) {
        const value = values[field.key];
        if (field.type === "IMAGE") {
            if (field.required && !value) return { success: false, reason: "INVALID_CUSTOMIZATION" };
            if (value) {
                if (
                    typeof value !== "string" ||
                    value.length > 500 ||
                    (!value.startsWith("private:story_child_") &&
                     !value.startsWith("private:tshirt_art_") &&
                     !value.startsWith("/uploads/customizations/") &&
                     !value.startsWith("stk_child_"))
                ) {
                    return { success: false, reason: "INVALID_CUSTOMIZATION" };
                }
                validated[field.key] = value;
            }
            continue;
        }

        if (field.required && !value) return { success: false, reason: "INVALID_CUSTOMIZATION" };
        if (!value) continue;
        if (field.key === "parent_phone" && !validateEgyptianPhone(value)) {
            return { success: false, reason: "INVALID_CUSTOMIZATION" };
        }
        if (field.type === "TEXT") {
            if (field.maxLength !== null && value.length > field.maxLength) {
                return { success: false, reason: "INVALID_CUSTOMIZATION" };
            }
        } else if (choiceTypes.has(field.type)) {
            const isKnownStickerDesign = field.key === "design_theme" && stickersData.product.designs.some(design => design.slug === value);
            if (!isKnownStickerDesign && !field.options.some(option => option.value === value)) {
                return { success: false, reason: "INVALID_CUSTOMIZATION" };
            }
        }
        validated[field.key] = value;
    }

    // Preserve allowed extra fields if they weren't in the DB fields list
    for (const extraKey of ["child_name", "parent_phone", "custom_design_text", "school_name", "grade", "class_name", "child_photo"]) {
        if (extraKey === "parent_phone" && values[extraKey] && !validateEgyptianPhone(values[extraKey])) {
            return { success: false, reason: "INVALID_CUSTOMIZATION" };
        }
        const val = values[extraKey];
        if (val && !validated[extraKey]) {
            if (typeof val === "string" && val.length <= 500) {
                if (extraKey === "child_photo") {
                    const keys = val.split(",").map((k) => k.trim()).filter(Boolean);
                    if (keys.length > 0 && keys.every((k) => k.startsWith("private:") || k.startsWith("/uploads/") || k.startsWith("stk_child_"))) {
                        validated[extraKey] = val;
                    }
                } else {
                    validated[extraKey] = val;
                }
            }
        }
    }

    return { success: true, data: Object.keys(validated).length ? validated : undefined };
}

export function validateStickerPackageCustomization(
    fields: CustomizationFieldDefinition[],
    input: Record<string, string> | undefined,
    sku: string | undefined,
): CustomizationValidation {
    const counts = STICKER_PACKAGE_COUNTS[sku ?? ""];
    if (!counts) return { success: false, reason: "INVALID_CUSTOMIZATION" };
    const { ticket_designs, label_designs, ...baseInput } = input ?? {};
    const base = validateCustomization(fields, baseInput);
    if (!base.success || !base.data?.design_theme) return { success: false, reason: "INVALID_CUSTOMIZATION" };
    const primary = base.data.design_theme;
    const tickets = counts.tickets
        ? ticket_designs === undefined ? initialStickerMix(primary, counts.tickets) : parseStickerMix(ticket_designs, counts.tickets)
        : ticket_designs ? null : {};
    const labels = counts.labels
        ? label_designs === undefined ? initialStickerMix(primary, counts.labels) : parseStickerMix(label_designs, counts.labels)
        : label_designs ? null : {};
    if (!tickets || !labels) return { success: false, reason: "INVALID_CUSTOMIZATION" };
    if ((tickets["custom-design"] || labels["custom-design"] || sku?.endsWith("-AI")) && !base.data.custom_design_text?.trim()) {
        return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
    return { success: true, data: {
        ...base.data,
        ...(counts.tickets ? { ticket_designs: serializeStickerMix(tickets) } : {}),
        ...(counts.labels ? { label_designs: serializeStickerMix(labels) } : {}),
    } };
}

export const VALID_TSHIRT_COLORS = new Set(["white", "black", "gray"]);
export const VALID_TSHIRT_CHILDREN_SIZES = ["2", "4", "6", "8", "10", "12", "14", "16"] as const;
export const VALID_TSHIRT_ADULT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const VALID_TSHIRT_SIZES: Set<string> = new Set<string>([
  ...VALID_TSHIRT_CHILDREN_SIZES,
  ...VALID_TSHIRT_ADULT_SIZES,
]);
export const SUPPORTED_TSHIRT_CUSTOMIZATION_KEYS = new Set([
  "garment_color",
  "garment_size",
  "custom_design_file",
  "custom_design_filename",
  "custom_design_text",
  "print_placement",
]);

export const TSHIRT_ARTWORK_TOKEN_REGEX = /^private:tshirt_art_[a-zA-Z0-9_\-]+\.(jpg|png|webp)$/;

export type TshirtCustomizationReason =
  | "INVALID_CUSTOMIZATION"
  | "INVALID_GARMENT_COLOR"
  | "INVALID_GARMENT_SIZE"
  | "MISSING_CUSTOMIZATION";

export function validateTshirtCustomization(input?: Record<string, string>): {
  success: boolean;
  reason?: TshirtCustomizationReason;
  data?: Record<string, string>;
} {
  const values = normalizeCustomization(input) ?? {};

  // Reject unsupported / unexpected customization keys
  for (const key of Object.keys(values)) {
    if (!SUPPORTED_TSHIRT_CUSTOMIZATION_KEYS.has(key)) {
      return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
  }

  const color = values.garment_color;
  const rawSize = values.garment_size;
  const size = typeof rawSize === "string" ? rawSize.trim().toUpperCase() : rawSize;
  const artwork = values.custom_design_file;
  const text = values.custom_design_text;
  const placement = values.print_placement;

  if (!color || typeof color !== "string" || !VALID_TSHIRT_COLORS.has(color)) {
    return { success: false, reason: "INVALID_GARMENT_COLOR" };
  }

  if (!size || typeof size !== "string" || !VALID_TSHIRT_SIZES.has(size)) {
    return { success: false, reason: "INVALID_GARMENT_SIZE" };
  }

  if (placement !== undefined && placement !== "center_chest") {
    return { success: false, reason: "INVALID_CUSTOMIZATION" };
  }

  let validArtwork: string | undefined;
  if (artwork !== undefined) {
    if (
      typeof artwork !== "string" ||
      artwork.length > 250 ||
      !TSHIRT_ARTWORK_TOKEN_REGEX.test(artwork)
    ) {
      return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
    validArtwork = artwork;
  }

  let validText: string | undefined;
  if (text !== undefined) {
    if (typeof text !== "string") {
      return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
    const trimmed = text.trim();
    if (trimmed.length > 0 && trimmed.length < 3) {
      return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
    if (trimmed.length > 500) {
      return { success: false, reason: "INVALID_CUSTOMIZATION" };
    }
    if (trimmed.length >= 3) {
      validText = trimmed;
    }
  }

  // Logical OR requirement: must have at least one valid customization method
  if (!validArtwork && !validText) {
    return { success: false, reason: "MISSING_CUSTOMIZATION" };
  }

  const result: Record<string, string> = {
    garment_color: color,
    garment_size: size,
    print_placement: "center_chest",
  };

  if (validArtwork) {
    result.custom_design_file = validArtwork;
    if (values.custom_design_filename && typeof values.custom_design_filename === "string") {
      result.custom_design_filename = values.custom_design_filename.slice(0, 150);
    }
  }

  if (validText) {
    result.custom_design_text = validText;
  }

  return { success: true, data: result };
}


