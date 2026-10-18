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


