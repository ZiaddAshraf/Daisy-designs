import type { Locale } from "@/lib/locale";
import stickersData from "@/data/stickers-product.json";
import { parseStickerMix } from "@/lib/sticker-package-mix";

const FIELD_LABELS_AR: Record<string, string> = {
  child_name: "اسم الطفل",
  parent_phone: "موبايل ولي الأمر",
  school_name: "المدرسة",
  grade: "الصف الدراسي",
  class_name: "الفصل / المجموعة",
  design_theme: "التصميم",
  ticket_designs: "توزيع الـ٢٠ تيكت",
  label_designs: "توزيع الـ٢٥ ليبل",
  child_photo: "صورة الطفل",
  garment_color: "لون التيشيرت",
  garment_size: "المقاس",
  custom_design_file: "التصميم المرفق",
  custom_design_text: "وصف فكرة التصميم",
  print_placement: "مكان الطباعة",
};

const FIELD_LABELS_EN: Record<string, string> = {
  child_name: "Child's Name",
  parent_phone: "Parent Phone",
  school_name: "School",
  grade: "Grade",
  class_name: "Class",
  design_theme: "Design",
  ticket_designs: "20 ticket designs",
  label_designs: "25 label designs",
  child_photo: "Child's Photo",
  garment_color: "T-Shirt Color",
  garment_size: "Size",
  custom_design_file: "Attached Artwork",
  custom_design_text: "Design Description",
  print_placement: "Print Placement",
};

const DESIGN_NAMES_AR: Record<string, string> = {
  "custom-design": "استيكر مخصص بتصميمك الخاص (Custom)",
  "kpop-demon-hunters": "كي بوب ديمون هنترز (K-Pop)",
  "super-cool-dino": "ديناصورات مرحة (Dino)",
  "kuromi": "كورومي سانريو (Kuromi)",
  "superman": "سوبرمان بوب آرت (Superman)",
  "princess": "قصر الأميرات (Princess)",
  "minecraft": "عالم ماينكرافت (Minecraft)",
  "space-astronaut": "رواد فضاء (Astronaut)",
  "mermaid": "حورية البحر (Mermaid)",
  "cars-lightning": "سيارات سباق (Cars)",
  "unicorn": "يونيكورن وقوس قزح (Unicorn)",
  "spiderman-miles": "سبايدرمان مايلز (Spiderman)",
  "cute-animals": "حيوانات مرحة (Cute Animals)",
  "football-champion": "أبطال كرة القدم (Football)",
  "batman-dark-knight": "باتمان فارس الظلام (Batman)",
  "barbie-fashion": "باربي فاشون (Barbie)",
  "sonic-speed": "سونيك السريع (Sonic)",
  "naruto": "ناروتو شيبودن (Naruto)",
  "brawl-stars": "برول ستارز (Brawl Stars)",
  "super-mario": "سوبر ماريو (Super Mario)",
  "frozen-elsa": "فروزن إلسا (Frozen Elsa)",
  "spiderman-classic": "سبايدرمان كلاسيك (Spiderman)",
  "barbie-gingham": "باربي فستان وردي (Barbie)",
  "numberblocks": "نامبر بلوكس (Numberblocks)",
  "superman-city-hero": "سوبرمان بطل المدينة (Superman)",
};

const DESIGN_NAMES_EN: Record<string, string> = {
  "custom-design": "Custom Design Sticker Sheet (Custom)",
  "kpop-demon-hunters": "K-Pop Demon Hunters",
  "super-cool-dino": "Super Cool Dino",
  "kuromi": "Kuromi Purple Sanrio",
  "superman": "Superman Comic Pop Art",
  "princess": "Pink Princess Castle",
  "minecraft": "Minecraft Pixel World",
  "space-astronaut": "Space Astronaut & Galaxy",
  "mermaid": "Magical Ocean Mermaid",
  "cars-lightning": "Lightning Racing Cars",
  "unicorn": "Unicorn & Rainbow",
  "spiderman-miles": "Spiderman Miles Morales",
  "cute-animals": "Cute Forest Animals",
  "football-champion": "Football Champion",
  "batman-dark-knight": "Batman Dark Knight",
  "barbie-fashion": "Barbie Stylish Fashion",
  "sonic-speed": "Sonic the Hedgehog",
  "naruto": "Naruto Shippuden Fire Ninja",
  "brawl-stars": "Brawl Stars Battle Heroes",
  "super-mario": "Super Mario Classic",
  "frozen-elsa": "Frozen Elsa Magic",
  "spiderman-classic": "Classic Spiderman Web",
  "barbie-gingham": "Barbie Pink Gingham",
  "numberblocks": "Numberblocks Math Adventure",
  "superman-city-hero": "Superman Epic City Hero",
};

export type FormattedCustomization = {
  key: string;
  label: string;
  displayValue: string;
  isPhoto: boolean;
  photoUrl?: string;
};

export function getCustomizationFieldLabel(key: string, locale: Locale, isStory = false): string {
  if (key === "custom_design_text" && isStory) {
    return locale === "ar" ? "بيانات وتفاصيل القصة" : "Story Details & Plot";
  }
  if (locale === "ar") {
    return FIELD_LABELS_AR[key] ?? key.replace(/_/g, " ");
  }
  return FIELD_LABELS_EN[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCustomizationValue(
  key: string,
  value: string,
  locale: Locale
): { displayValue: string; isPhoto: boolean; photoUrl?: string } {
  if (!value) {
    return { displayValue: "", isPhoto: false };
  }
  if (key === "ticket_designs" || key === "label_designs") {
    const mix = parseStickerMix(value, key === "ticket_designs" ? 20 : 25);
    if (mix) {
      const displayValue = Object.entries(mix).map(([slug, count]) => {
        const design = stickersData.product.designs.find(item => item.slug === slug);
        return `${count} × ${locale === "ar" ? design?.arabicTitle : design?.title}`;
      }).join(locale === "ar" ? "، " : ", ");
      return { displayValue, isPhoto: false };
    }
  }

  if (value === "private:story_child_whatsapp_pending.jpg") {
    return {
      displayValue:
        locale === "ar"
          ? "سيتم إرسال صور الطفل عبر الواتساب لاحقاً 💬"
          : "Child photos will be sent via WhatsApp 💬",
      isPhoto: false,
      photoUrl: undefined,
    };
  }

  if (value.startsWith("private:story_child_")) {
    return {
      displayValue: locale === "ar" ? "صورة مرفقة ومؤمنة" : "Secured Photo Attached",
      isPhoto: true,
      photoUrl: undefined,
    };
  }

  if (value.startsWith("private:tshirt_art_")) {
    return {
      displayValue: locale === "ar" ? "تصميم مرفق ومؤمن" : "Secured Artwork Attached",
      isPhoto: true,
      photoUrl: undefined,
    };
  }

  if (key === "garment_color") {
    const colorMap: Record<string, { ar: string; en: string }> = {
      white: { ar: "أبيض", en: "White" },
      black: { ar: "أسود", en: "Black" },
      gray: { ar: "رمادي", en: "Gray" },
    };
    const localizedColor = colorMap[value];
    if (localizedColor) {
      return {
        displayValue: locale === "ar" ? localizedColor.ar : localizedColor.en,
        isPhoto: false,
      };
    }
  }

  if (key === "print_placement") {
    if (value === "center_chest") {
      return {
        displayValue: locale === "ar" ? "منتصف الصدر" : "Center Chest",
        isPhoto: false,
      };
    }
  }

  if (key === "garment_size") {
    return {
      displayValue: locale === "ar" ? `مقاس ${value}` : `Size ${value}`,
      isPhoto: false,
    };
  }

  if (
    key === "child_photo" ||
    key === "custom_design_file" ||
    value.startsWith("/uploads/") ||
    value.startsWith("http")
  ) {
    const photoCount = value.includes(",") ? value.split(",").filter(Boolean).length : 1;
    return {
      displayValue:
        photoCount > 1
          ? locale === "ar"
            ? `${photoCount} صور مرفقة`
            : `${photoCount} Photos Attached`
          : locale === "ar"
          ? "صورة مرفقة"
          : "Photo Attached",
      isPhoto: true,
      photoUrl: value.split(",")[0].trim(),
    };
  }

  if (key === "design_theme") {
    const localizedDesign =
      locale === "ar" ? DESIGN_NAMES_AR[value] : DESIGN_NAMES_EN[value];
    if (localizedDesign) {
      return { displayValue: localizedDesign, isPhoto: false };
    }
  }

  return { displayValue: value, isPhoto: false };
}

export function formatCustomizationEntries(
  customization: Record<string, string> | undefined | null,
  locale: Locale
): FormattedCustomization[] {
  if (!customization) return [];

  // Preferred order of display
  const keyOrder = [
    "garment_color",
    "garment_size",
    "print_placement",
    "custom_design_file",
    "custom_design_text",
    "child_name",
    "design_theme",
    "ticket_designs",
    "label_designs",
    "school_name",
    "grade",
    "class_name",
    "parent_phone",
    "child_photo",
  ];

  const entries: FormattedCustomization[] = [];
  const keys = Object.keys(customization);

  const isTshirt = Boolean(customization.garment_color || customization.garment_size || customization.print_placement);
  const isStory = !isTshirt && Boolean(
    customization.child_photo?.startsWith("private:story_child_") ||
    customization.story_title ||
    customization.story_slug ||
    customization.custom_design_text?.includes("القصة")
  );

  // Add sorted recognized keys first
  for (const orderedKey of keyOrder) {
    if (orderedKey in customization && customization[orderedKey]) {
      const val = customization[orderedKey];
      const { displayValue, isPhoto, photoUrl } = formatCustomizationValue(
        orderedKey,
        val,
        locale
      );
      entries.push({
        key: orderedKey,
        label: getCustomizationFieldLabel(orderedKey, locale, isStory),
        displayValue,
        isPhoto,
        photoUrl,
      });
    }
  }

  // Add any extra custom keys
  for (const key of keys) {
    if (!keyOrder.includes(key) && customization[key]) {
      const val = customization[key];
      const { displayValue, isPhoto, photoUrl } = formatCustomizationValue(key, val, locale);
      entries.push({
        key,
        label: getCustomizationFieldLabel(key, locale, isStory),
        displayValue,
        isPhoto,
        photoUrl,
      });
    }
  }

  return entries;
}

