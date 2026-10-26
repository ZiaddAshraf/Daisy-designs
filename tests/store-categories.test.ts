import assert from "node:assert/strict";
import test from "node:test";
import {
  STORE_CATEGORIES,
  getStoreCategories,
  getStoreCategory,
  categoryNameForLocale,
  categoryTaglineForLocale,
  categoryDescriptionForLocale,
  categoryNoticeForLocale,
} from "../src/lib/store-categories";

test("store categories contains exactly four confirmed categories in stable order", () => {
  const categories = getStoreCategories();
  assert.equal(categories.length, 4);
  assert.deepEqual(
    categories.map((c) => c.slug),
    ["stickers", "reward-cards", "customized-stories", "printed-t-shirts"],
  );
  assert.deepEqual(
    categories.map((c) => c.letter),
    ["S", "R", "C", "T"],
  );
});

test("stickers category has updated Tickets, Labels & Keychains content in English and Arabic", () => {
  const stickers = getStoreCategory("stickers");
  assert.ok(stickers, "stickers category should exist");
  assert.equal(stickers.id, "stickers");
  assert.equal(stickers.letter, "S");
  assert.equal(categoryNameForLocale(stickers, "en"), "Tickets, Labels & Keychains");
  assert.equal(categoryNameForLocale(stickers, "ar"), "تيكت وليبل وميدالية");
  assert.ok(categoryTaglineForLocale(stickers, "ar")?.includes("ميداليات"));
  assert.ok(categoryTaglineForLocale(stickers, "en")?.includes("keychains"));
});

test("printed-t-shirts category has valid English and Arabic content and typographic mark", () => {
  const tshirts = getStoreCategory("printed-t-shirts");
  assert.ok(tshirts, "printed-t-shirts category should exist");
  assert.equal(tshirts.id, "printed-t-shirts");
  assert.equal(tshirts.letter, "T");
  assert.equal(categoryNameForLocale(tshirts, "en"), "Printed T-Shirts");
  assert.equal(categoryNameForLocale(tshirts, "ar"), "تيشيرتات مطبوعة");
  assert.equal(categoryTaglineForLocale(tshirts, "en"), "Plain cotton T-shirts for adults and kids customized with your artwork on the center chest");
  assert.equal(categoryTaglineForLocale(tshirts, "ar"), "تيشيرتات قطن سادة للكبار والأطفال مخصصة بطباعة تصميمك الخاص على منتصف الصدر");
  assert.equal(categoryDescriptionForLocale(tshirts, "en"), "High-quality plain cotton T-shirts for adults and kids customized with your uploaded artwork or written idea. Printed on the center chest, reviewed by our team via WhatsApp, and prepared in 2–3 business days.");
  assert.equal(categoryDescriptionForLocale(tshirts, "ar"), "تيشيرتات قطن سادة عالية الجودة للكبار والأطفال، مخصصة بطباعة رسمتك أو فكرتك على منتصف الصدر. تتم مراجعة كل طلب يدويًا وتأكيده عبر الواتساب، وتستغرق مدة التجهيز من يومين إلى ٣ أيام عمل قبل الشحن.");
  assert.ok(categoryNoticeForLocale(tshirts, "en"));
  assert.ok(categoryNoticeForLocale(tshirts, "ar"));
});

test("slug aliases correctly resolve to primary category slugs", () => {
  assert.equal(getStoreCategory("t-shirts")?.slug, "printed-t-shirts");
  assert.equal(getStoreCategory("tshirts")?.slug, "printed-t-shirts");
  assert.equal(getStoreCategory("school-stickers")?.slug, "stickers");
  assert.equal(getStoreCategory("non-existent"), undefined);
});

test("all store categories have complete bilingual content without empty fields", () => {
  for (const cat of STORE_CATEGORIES) {
    assert.ok(cat.id.length > 0);
    assert.ok(cat.slug.length > 0);
    assert.ok(cat.name.length > 0);
    assert.ok(cat.arabicName.length > 0);
    assert.ok(cat.tagline.length > 0);
    assert.ok(cat.arabicTagline.length > 0);
    assert.ok(cat.description.length > 0);
    assert.ok(cat.arabicDescription.length > 0);
    assert.ok(cat.letter.length === 1);
  }
});
