export const EGYPTIAN_GOVERNORATES = [
    { id: "cairo", fee: 80, nameAr: "القاهرة", nameEn: "Cairo", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "giza", fee: 80, nameAr: "الجيزة", nameEn: "Giza", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "alexandria", fee: 95, nameAr: "الإسكندرية", nameEn: "Alexandria", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "qalyubia", fee: 95, nameAr: "القليوبية", nameEn: "Qalyubia", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "sharqia", fee: 95, nameAr: "الشرقية", nameEn: "Sharqia", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "dakahlia", fee: 95, nameAr: "الدقهلية (المنصورة)", nameEn: "Dakahlia (Mansoura)", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "gharbia", fee: 95, nameAr: "الغربية (طنطا / المحلة)", nameEn: "Gharbia (Tanta / Mahalla)", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "monufia", fee: 95, nameAr: "المنوفية", nameEn: "Monufia", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "damietta", fee: 95, nameAr: "دمياط", nameEn: "Damietta", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "port_said", fee: 100, nameAr: "بورسعيد", nameEn: "Port Said", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "ismailia", fee: 100, nameAr: "الإسماعيلية", nameEn: "Ismailia", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "suez", fee: 100, nameAr: "السويس", nameEn: "Suez", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "kafr_el_sheikh", fee: 95, nameAr: "كفر الشيخ", nameEn: "Kafr El-Sheikh", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "beheira", fee: 95, nameAr: "البحيرة", nameEn: "Beheira", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "fayoum", fee: 110, nameAr: "الفيوم", nameEn: "Fayoum", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "beni_suef", fee: 110, nameAr: "بني سويف", nameEn: "Beni Suef", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "minya", fee: 110, nameAr: "المنيا", nameEn: "Minya", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "asyut", fee: 110, nameAr: "أسيوط", nameEn: "Asyut", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "sohag", fee: 110, nameAr: "سوهاج", nameEn: "Sohag", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "qena", fee: 130, nameAr: "قنا", nameEn: "Qena", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "luxor", fee: 110, nameAr: "الأقصر", nameEn: "Luxor", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "aswan", fee: 130, nameAr: "أسوان", nameEn: "Aswan", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "red_sea", fee: 130, nameAr: "البحر الأحمر (الغردقة)", nameEn: "Red Sea (Hurghada)", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "matrouh", fee: 160, nameAr: "مطروح والساحل الشمالي", nameEn: "Matrouh & North Coast", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "new_valley", fee: 110, nameAr: "الوادي الجديد", nameEn: "New Valley", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "north_sinai", fee: null, nameAr: "شمال سيناء", nameEn: "North Sinai", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
    { id: "south_sinai", fee: 160, nameAr: "جنوب سيناء (شرم الشيخ)", nameEn: "South Sinai (Sharm El-Sheikh)", etaAr: "توصيل سريع", etaEn: "Fast delivery" },
] as const;

export function shippingFeeFor(destination: string) {
    const key = destination.trim().toLowerCase();
    const region = EGYPTIAN_GOVERNORATES.find(gov =>
        gov.id === key || gov.nameAr === key || gov.nameEn.toLowerCase() === key
    );
    return region?.fee ?? null;
}

export function calculateShipping(destination: string) {
    const fee = shippingFeeFor(destination);
    if (fee === null) throw new Error("INVALID_DESTINATION");
    return fee;
}
