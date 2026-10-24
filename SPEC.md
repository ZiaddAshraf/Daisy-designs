# SPEC: Daisy Designs Customized Storybook "أول سنة في المدرسة" (First Year at School)

## 1. Objective
Implement the new physical printed customized storybook product **"أول سنة في المدرسة" (First Year at School)** under the **"قصص مخصصة" (`customized-stories`)** category in Daisy Designs (`D:\esssam\store`). The product must integrate seamlessly into the existing storefront, cart, and COD checkout architecture while upholding strict security and privacy standards for children's photos.

---

## 2. Confirmed Requirements & Specifications

### 2.1 Commercial & Product Decisions
- **Product Name**:
  - Arabic: قصة "أول سنة في المدرسة"
  - English: "First Year at School" Customized Storybook
- **Product Slug**: `first-year-at-school`
- **Category Slug**: `customized-stories` (Category Name: "قصص مخصصة" / "Customized Stories")
- **Price**: Strictly **200 EGP** per printed copy.
- **Physical Format**: Physical printed hardcopy paper book, shipped directly to customer's home. **Not a PDF download or digital product**.
- **Target Preparation Time**: **1 business day** (displayed clearly as production prep time before shipping).
- **Provisional Print Specifications (Pending Print-Shop Confirmation)**:
  - Target size: **A4** (provisional).
  - Target cover: **Softcover** (provisional).
  - Note: Explicitly marked on the product page as pending technical confirmation from the printing provider.

### 2.2 Story Content & Asset Inventory (10 Images)
- All 10 original story images from `D:\esssam\Customized story` are preserved in their exact order without modification, cropping, or regeneration:
  1. **Cover (الغلاف الأمامي)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (7).jpeg` (902×1280)
  2. **Page 1 (الصفحة الأولى)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (6).jpeg` (902×1280) — "صباح الخير! أنا عز..."
  3. **Page 2 (الصفحة الثانية)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (5).jpeg` (902×1280) — "ودعت بابا وماما وركبت باص المدرسة..."
  4. **Page 3 (الصفحة الثالثة)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (4).jpeg` (902×1280) — "في المدرسة استقبلتني الميس..."
  5. **Page 4 (الصفحة الرابعة)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (3).jpeg` (902×1280) — "في الفصل عملت أنشطة ممتعة..."
  6. **Page 5 (الصفحة الخامسة)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (2).jpeg` (902×1280) — "وقت البريك خرجت ألعب مع صحابي..."
  7. **Page 6 (الصفحة السادسة)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM (1).jpeg` (902×1280) — "في البريك فتحت اللانش بوكس..."
  8. **Page 7 (الصفحة السابعة)**: `WhatsApp Image 2026-10-14 at 12.02.35 AM.jpeg` (902×1280) — "وفي آخر اليوم رجعت من المدرسة..."
  9. **Page 8 (الصفحة الثامنة)**: `WhatsApp Image 2026-10-14 at 12.02.36 AM (1).jpeg` (902×1280) — "أنا عز وأتعلم كل يوم..."
  10. **Back Cover (الغلاف الخلفي)**: `WhatsApp Image 2026-10-14 at 12.02.36 AM.jpeg` (902×1280) — شعار Daisy Designs والخاتمة
- **Fixed Narrative**: Story text, dialogue, illustrations, and sequence are 100% fixed by the store owner. Customers must **not** edit or rewrite any story text.

### 2.3 Personalization & Child Photo Upload
- **Sole Customer Personalization**: Uploading a photo of the child (`child_photo`).
- **Required Field**: "Add to Cart" is disabled until a valid child photo is uploaded.
- **No Story Editing / No Child Name Field**: No narrative editing controls or child name input.

### 2.4 Security & Privacy Protocol for Children's Photos
- **Private Non-Public Storage**:
  - Saved to `storage/private_uploads/story_child_photos/` outside the web root.
  - Never exposed via static `/uploads/` URLs.
- **Server-Side Validation**:
  - Magic bytes check: JPEG (`0xFF 0xD8 0xFF`), PNG (`0x89 0x50 0x4E...`), WebP (`RIFF...WEBP`).
  - Max file size: 10 MB.
  - Min dimensions: 600×600 px.
- **Metadata Sanitation**:
  - Strip all EXIF / GPS tags immediately upon receipt.
- **Access Control & Retention**:
  - Authorized admin API route: `GET /api/admin/orders/[id]/child-photo`.
  - 24-hour cleanup for orphaned uncompleted uploads.
  - 30-day post-delivery purge policy after physical order fulfillment.

### 2.5 Cart & Checkout Isolation
- Isolated cart line generation using `cartIdentity` / `cartLineId` with `customization: { child_photo: storageKey }`.
- Snapshotting customization in `OrderItem.customization` and `OrderItem.productSnapshot`.
- COD checkout integration with existing address & shipping calculations.
 
### 2.6 Product Catalog Card Design (Reference Image Matching)
- **Grid Layout**: 3 columns on desktop (`lg:grid-cols-3`), 2 columns on tablet/mobile (`sm:grid-cols-2 md:grid-cols-2`), with comfortable spacing (`gap-6 sm:gap-7 lg:gap-8`).
- **Card Container**: `rounded-3xl` / `rounded-[28px]`, pure white background (`bg-white dark:bg-neutral-900`), soft border (`border-slate-100 dark:border-neutral-800`), smooth elevation hover (`shadow-sm hover:shadow-lg transition-all duration-300`).
- **Image Section**:
  - Soft pastel backdrop container (`bg-[#eaf4fa] dark:bg-neutral-800/60`).
  - Top-start circular floating wishlist button (`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500`) hooked into `useWishlist`.
  - Bottom arched tab pill (`rounded-t-xl bg-white px-3.5 py-1 text-[11px] font-semibold text-slate-700 border-t border-x border-slate-200/80 shadow-xs`) displaying the design / variant name.
- **Card Typography & Information**:
  - Category header: Teal bold subtitle (`text-teal-600 dark:text-teal-400 text-xs sm:text-[13px] font-bold`).
  - Product title: Prominent bold title (`text-slate-900 dark:text-neutral-100 font-extrabold text-base sm:text-lg`).
  - Subtitle / Description: Single line truncated with ellipsis (`text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] line-clamp-1`).
  - Price: Clean, prominent, right-aligned bold price (`text-teal-600 dark:text-teal-400 font-black text-lg sm:text-xl`) formatted as `${price}.00 ج.م`.
  - Minimalist interaction: The card acts as a clean direct link to the product customizer without bulky full-width buttons cluttering the bottom.

### 2.7 Phase 16: Comprehensive Storefront Polish, Auth & Account Redesign, and Wishlist Unification
- **Wishlist Unification**:
  - Connect StoryBook Preview (`/products/first-year-at-school`) and Reward Cards Preview (`/categories/reward-cards` and `/products/reward-cards-box-set`) directly to `useWishlist()`.
  - Ensure wishlist toggle updates the global reactive wishlist, cart header badge, and `/wishlist` collection.
- **Search UX & Tactile Polish**:
  - Header search submit button uses bidirectional arrow (`ArrowLeft` in RTL, `ArrowRight` in LTR).
  - Search panel buttons have circular pill geometry (`rounded-full`), smooth cubic-bezier transitions, and active scale feedback (`scale(0.92)`).
- **Auth & Account Form Modernization**:
  - Full bilingual RTL/LTR responsiveness on `/login`, `/register`, `/forgot-password`, `/reset-password`.
  - Accessible card containers with high-contrast themed text inputs, focus rings, and dark mode CTA submit buttons (`dark:bg-white dark:text-neutral-950`).
- **Static Pages & Catalog Controls**:
  - Primary CTAs on `/about` (`.about-cta`), `/faq` (`.faq-contact a`), and `/contact` have tactile pill geometry (`border-radius: 999px`), hover lift, and WCAG AAA contrast in both light and dark themes.
  - Filter chips and filter submit buttons (`.catalog-apply`, `.catalog-filter-chip`) use rounded geometry and dark mode high-contrast tokens.
  - Remove legacy `filter: grayscale(1)` from collection cards so authentic colorful Daisy Designs artwork renders vividly.

### 2.8 Phase 17: Custom Printed Children's T-Shirts Specification
- **Product Scope**: Strictly Plain Children's T-Shirts (`custom-printed-tshirt`) under category `printed-t-shirts` (aliases: `t-shirts`, `tshirts`). All adult sizing and options are excluded.
- **Price**: Uniform **500 EGP** across all colors and sizes.
- **Colors**: Three confirmed colors: White (`#FFFFFF`), Black (`#1E1E1E`), and Gray (`#9CA3AF`).
- **Sizes & Measurements**: Exact measurements extracted from `D:\esssam\Size chart\WhatsApp Image 2026-10-17 at 2.46.25 AM (1).jpeg`:
  - Size 2: Width 32 cm, Length 45 cm
  - Size 4: Width 34 cm, Length 47 cm
  - Size 6: Width 36 cm, Length 49 cm
  - Size 8: Width 38 cm, Length 52 cm
  - Size 10: Width 40 cm, Length 54 cm
  - Size 12: Width 42 cm, Length 56 cm
  - Size 14: Width 44 cm, Length 58 cm
  - Size 16: Width 46 cm, Length 60 cm
  - Measurements are in centimeters (سم). Diagram shows Width (العرض) across chest, Length (الطول) shoulder to hem, Sleeve (الكم) short-sleeve length.
- **Print Placement**: Strictly **Center Chest only** (منتصف الصدر فقط).
- **Production Turnaround**: **2–3 business days** before shipping.
- **Inventory Pool**: One shared aggregate inventory pool across all colors and sizes (initial stock pending confirmation).
- **Customization Gate**: Flexible dual-input (Upload image OR Text description OR Both). Add to Cart active when `validUpload || text.length >= 3`.
- **Size Guide Experience**:
  - Accessible modal triggered by `[ 📏 دليل المقاسات ]` beside size selector.
  - Responsive table showing exact sizes 2–16 and cm measurements without horizontal overflow on mobile.
  - Original measuring diagram and clear terminology explanations.
  - Preserves selected color, size, uploaded file, and written text when opened or closed.
  - Keyboard navigation (`Esc`, focus trap), RTL/LTR, Light/Dark modes.
- **Upload Security & Privacy**:
  - Private non-public storage: `storage/private_uploads/tshirt_artwork/`.
  - Server-side magic bytes validation (JPEG, PNG, WebP), 10MB limit, EXIF/GPS stripping, resolution threshold ($\ge 600\text{px}$).
  - Authorized admin route `GET /api/admin/orders/[id]/tshirt-artwork`.
- **Review & Order Protocol**:
  - Transparent storefront banner: orders undergo manual review before printing.
  - Admin dashboard: Displays garment color, size, print placement (Center Chest), artwork download, customer text, and 1-click WhatsApp customer contact button.
  - Cart line isolation: Unique `cartLineId` per customization.

### 2.10 Phase 21: Stickers Category Inline Customization & Direct Add-to-Cart Redesign
- **Removal of Detail-Page Navigation**:
  - Clicking any sticker card or "خصص الآن" on `/categories/stickers` must open the inline customization modal on the category page without navigating away.
  - Links to `/products/custom-waterproof-stickers` from the category card grid are removed.
- **Inline Customization Modal**:
  - High-resolution design preview & craftsmanship pillars.
  - Child's Name: Required (exact spelling and casing preserved).
  - School Name: Optional.
  - Grade / Class: Optional.
  - Parent's Egyptian Mobile: Required (enforcing Egyptian phone regex).
  - Child's Photo / Design Reference: Optional (via `/api/uploads/customization`).
  - For Custom Design (`id: 0`): Design Idea Description is Required.
  - Quantity Selector: Stepper with live price scaling (`product.price * quantity`).
- **Direct Add to Cart**:
  - "أضف للسلة" button in modal triggers `useCart().add(...)` with isolated `cartLineId`.
  - Automatic reveal of `CartDrawer` with customized chips upon submission.
  - Success feedback toast and prevention of duplicate submissions.
- **Editorial Category Layout**:
  - Premium Daisy Designs header: value proposition, 50 EGP pricing highlight, and 3-step guide.
  - Search input, theme filters with counts, and sort selector.
  - 3-column / 2-column responsive luxury grid with "خصص الآن" CTA and unobtrusive wishlist hearts.

### 2.11 Phase 22: Removal of All Emojis and Sparkle Icons Across Storefront
- **Sparkle Icon Removal**:
  - Removed all instances of the yellow/amber `<Sparkles>` and `<SparkleStar>` icons across buttons, headers, cards, and notice callouts.
  - Stickers CTA buttons now feature clean typography with directional chevron indicators.
  - Replaced decorative sparkles with semantic icons (`Tag`, `Palette`, `Info`, `Truck`, `ShieldCheck`, `BookOpen`, `Shirt`, `Ruler`).
- **Unicode Emoji Elimination**:
  - Completely stripped all Unicode emojis (`✨`, `🏷️`, `💡`, `⏱️`, `✓`, `♡`) from all components, data fixtures, and banners.
  - Maintained authentic, high-end editorial typography adhering to Daisy Designs luxury identity.

### 2.12 Phase 23: Clean Category Cards (Arrow and Number Removal)
- **Corner Index Numbers**:
  - Removed the `store-category-card__index` block (`1`, `2`, `3`, `4`, divider rule line, and flower icon) from all category cards on the homepage.
- **Arrow Removal**:
  - Removed diagonal title arrows (`↗`) from `CategoryCard` and `collection-card`.
  - Removed footer action arrows (`←` / `→`) from the "استكشف القسم" links, leaving clean, minimalist typography.

### 2.13 Phase 24: Sticker Backgrounds Full Card Coverage
- **Stickers Catalog & Products Grid**:
  - `catalog-card__frame` now features zero internal padding (`p-0`) and `object-cover` image rendering across `/categories/stickers` and `/products`.
  - Eliminates empty pastel side gutters, allowing the sticker artwork and background patterns to extend edge-to-edge.
- **Homepage Stickers Category Card**:
  - Retains clean standard layout with `object-fit: cover` on cover image, preserving visual balance and crisp typography without numbers or arrows.

### 2.14 Phase 25: Streamline Stickers Header & Eliminate Verbose Copy
- **Header Simplification**:
  - Completely removed the 3-step numbered instructional cards (١، ٢، ٣) and explanatory how-to-order paragraphs.
  - Removed redundant side badge card (`تخصيص مباشر وسريع`).
  - Replaced bulky banner with a clean, luxury category heading matching Daisy Designs design language:
    - Eyebrow: `DAISY DESIGNS / استيكرات مدرسية`
    - Title: `استيكرات مدرسية مخصصة`
    - 1-line subtitle: `فينيل أصلي مقاوم للماء والحرارة، مخصص باسم طفلك ومدرسته.`
    - Compact price and waterproof pills: `٥٠ ج.م للشيت` + `مقاوم للماء ١٠٠%`.
- **Card Description Trimming**:
  - Condensed sticker card description copy down to a crisp 1-line statement (`ملصقات مقاومة للماء باسم طفلك ومدرسته`).
- **Visual Impact**:
  - Category content and sticker cards now appear immediately above the fold without any distracting walls of text.

### 2.15 Phase 26: Fix Sticker Card Cropping & Portrait Sheet Fitting
- **Root Cause Identified**:
  - The browser subagent confirmed that all 25 sticker sheet images are tall vertical sheets (portrait aspect ratios ~0.668 to 0.826).
  - The previous container was landscape `aspect-[4/3.5]` (1.143). Applying `object-cover` forced vertical overflow, clipping ~41.6% of the sheet (top branding logo and bottom row stickers).
- **Portrait Frame Alignment**:
  - Updated `catalog-card__frame` in `src/components/stickers-catalog-client.tsx` to portrait `aspect-[3/4]` with `object-contain` and seamless surface background (`p-1 sm:p-1.5 bg-white dark:bg-neutral-900`).
  - Updated modal preview in `stickers-catalog-client.tsx` to portrait `aspect-[3/4]` with `object-contain`.
  - Updated `src/components/products-catalog-client.tsx` to `object-contain` with clean padding.
- **Result**:
  - Zero percent cropping: 100% of the sticker sheet is fully visible from top logo to bottom name labels.
  - Image fills the portrait card snugly edge-to-edge without awkward letterboxing borders.

### 2.18 Phase 29: Mobile UI/UX & Responsive Experience Optimization
- **Touch Target Ergonomics (WCAG 2.5.5 Compliant)**:
  - Header icon buttons (`.daisy-header .daisy-icon-button`) enforced to minimum 44×44px across all viewports (320px–430px).
  - Round link buttons (`.daisy-round-link`) upgraded from 42px to 44×44px.
  - Cart drawer and cart page steppers (`.w-11 .h-11`) and delete buttons have min 44px tap zones with comfortable hitboxes.
  - Reward cards steppers (`.rc-qty-btn`) upgraded to 44×44px and wishlist button to min-height 44px.
  - T-shirt size guide close button upgraded to 44×44px and guide trigger to min-height 44px.
  - Mobile drawer navigation links padded to min 48px height.
- **Form Input UX & iOS Safari Auto-Zoom Prevention**:
  - Global CSS rule in `globals.css` enforcing `font-size: 16px !important` on mobile (`< 768px`) for all input, textarea, and select elements, preventing iOS Safari auto-zoom permanently.
  - Native mobile keyboard optimizations: `inputMode="tel"` on Egyptian phone fields.
  - Added `w-full min-w-0` to all checkout inputs and textareas and reduced card padding to `p-4 sm:p-6`, eliminating all horizontal overflow down to 320px.
- **Mobile Modal & Drawer Polish**:
  - Sticker customization modal sticky purchase footer on mobile with live line total, quantity stepper, and primary Add to Cart CTA pinned cleanly above screen bottom/keyboard.
  - T-shirt size guide modal table configured with smooth horizontal scrolling and 44px accessible close targets.
  - T-shirt visualizer color swatches container wraps responsively (`flex-col sm:flex-row`), avoiding text clipping on < 390px screens.
  - Removed duplicate breadcrumbs and outer double-padding on `/categories/printed-t-shirts`.
- **Watermark & Layout Stability**:
  - Contained `.daisy-cta__monogram-watermark` on mobile to 220px maximum with strict containment (`overflow: hidden`), preventing any horizontal scrollbar.
  - Fixed Storybook swipe gesture direction for RTL Arabic vs LTR English.
- **Ralph Loop Verification**:
  - 0 ESLint errors, 0 ESLint warnings (`npm run lint`).
  - 0 TypeScript errors (`tsc --noEmit`).
  - 90/90 automated tests passed (`npm test`).
  - 41/41 routes built cleanly in production Turbopack build (`npm run build`).

---

## 6. Frictionless Purchase Flow & High-Conversion UX Specification

### 6.1 Objective
Transform the entire customer purchase journey into an effortless, intuitive, and reassuring experience tailored specifically for Egyptian families:
"العميل اللي يخش يشتري يلاقي الدنيا سهلة ويعرف يشتري بسهولة"

### 6.2 Key Requirements & Enhancements
1. **Sticky Bottom Purchase Bar on Mobile (All Products)**:
   - Always visible when scrolling past the main buy button on mobile screens (< 768px).
   - Displays: Product thumbnail, name, formatted price (e.g., `٢٠٠ ج.م`).
   - Primary action button: `إضافة للسلة 🛒` + `اشتري الآن ⚡`.
   - Missing required field guidance: If child photo or required options are missing, tapping the button smoothly scrolls to the upload dropzone, focuses it, and displays an animated gentle pulse with a friendly Egyptian Arabic prompt.

2. **Instant "اشتري الآن" (Direct Checkout) Flow**:
   - Product pages provide a high-contrast direct buy button:
     - `اشتري الآن (دفع عند الاستلام)` -> Adds product with selected customizations directly to cart and immediately routes to `/checkout`.
     - Cuts checkout friction from 4 clicks down to 1 click.

3. **Optimized 1-Page Checkout for Egyptian Customers (`/checkout`)**:
   - **Governorates Dropdown `<select>`**: Replace free-text input with all 27 Egyptian Governorates (القاهرة، الجيزة، الإسكندرية، القليوبية، الشرقية، الدقهلية، الغربية، المنوفية، دمياط، بورسعيد، الإسماعيلية، السويس، كفر الشيخ، الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، البحر الأحمر، الوادي الجديد، مطروح، شمال سيناء، جنوب سيناء).
   - **Egyptian Phone Number Validation**: Auto-detects Egyptian mobile formats (010, 011, 012, 015) with instant green checkmark when 11 digits are reached.
   - **Alternative Phone / WhatsApp Field**: Added optional backup phone field for delivery couriers (`رقم بديل أو واتساب لتسهيل التواصل`).
   - **Prominent COD Reassurance**: Reassuring notice: "لن تدفع أي مبالغ الآن — الدفع نقداً عند استلام ومعاينة المنتج بالمنزل".
   - **Mobile Order Summary Always Clear**: Transparent price breakdown (Subtotal, Shipping / Free Shipping, Total).

4. **Cart Drawer Polish (`CartDrawer`)**:
   - Live Free Shipping progress bar with dynamic remaining amount.
   - Distinct badges for every customization attribute.
   - Min 44px tap targets for steppers and removal actions.
   - Reassurance footer: "الدفع عند الاستلام · شحن سريع لباب بيتك".

5. **WhatsApp Instant Order Confirmation**:
   - On the order success page (`/checkout/success`), provide a 1-tap WhatsApp button pre-filled with order details to connect directly with the Daisy Designs team.












---

## 7. Custom Printed T-Shirts: Adult & Children Sizes Specification

### 7.1 Objective
Expand the custom printed t-shirt line (`custom-printed-tshirt`) from kids-only to both Adults and Children ("عايزين التيشيرتات للكبار والصغيرين كمان مش صغار فقط") according to official source size charts in `D:\esssam\Size chart`.

### 7.2 Size Architecture & Measurements
- **Adult Sizes** (Source: `WhatsApp Image 2026-10-17 at 2.46.25 AM (2).jpeg`):
  - `S`: Width 50 cm, Length 70 cm
  - `M`: Width 52 cm, Length 72 cm
  - `L`: Width 54 cm, Length 74 cm
  - `XL`: Width 56 cm, Length 76 cm
  - `XXL`: Width 58 cm, Length 78 cm
- **Children Sizes** (Source: `WhatsApp Image 2026-10-17 at 2.46.25 AM (1).jpeg`):
  - `2`: Width 32 cm, Length 45 cm (Age 2)
  - `4`: Width 34 cm, Length 47 cm (Age 4)
  - `6`: Width 36 cm, Length 49 cm (Age 6)
  - `8`: Width 38 cm, Length 52 cm (Age 8)
  - `10`: Width 40 cm, Length 54 cm (Age 10)
  - `12`: Width 42 cm, Length 56 cm (Age 12)
  - `14`: Width 44 cm, Length 58 cm (Age 14)
  - `16`: Width 46 cm, Length 60 cm (Age 16)
- **Validation**:
  - `VALID_TSHIRT_SIZES = Set(["2", "4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL", "XXL"])` (with case-insensitive normalization).

### 7.3 Visual & Interactive Customizer Experience
- **Category Switcher / Segmented Tabs**:
  - Clear tabs for "مقاسات الكبار (S - XXL)" and "مقاسات الأطفال (سن ٢ - ١٦)".
  - Active category seamlessly renders the appropriate size pills with width indicators.
- **Bilingual Size Guide Modal**:
  - Dual tabs for Adults and Children with verified measurement tables and authentic chart assets (`adult-size-chart.jpeg`, `children-size-chart.jpeg`).
  - Visual measurement guide diagram (`measurement-guide-diagram.jpeg`).
- **Catalog, Marquee, & Admin Order Synchronization**:
  - Product names, badges, features, and descriptions updated to celebrate both Adults and Children.
  - Admin orders table clearly displays whether the ordered size is for an adult or child.
