"use client";

import Image from "@/components/site-image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { getProductImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { normalizeCustomization } from "@/lib/commerce-rules";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ScrollReveal } from "@/components/scroll-reveal";
import { adjustCartLine, cartLineId, checkoutLinePayload, mergeCartLine, normalizeStoredCartLine, removeCartLine } from "@/lib/cart-line-state";
import { directionForLocale, type Locale } from "@/lib/locale";
import { formatMessage, getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { BrandLogo } from "@/components/brand-logo";

type CartVariant = { id: string; name: string; stock: number };
type CartItem = Product & { lineId: string; quantity: number; customization?: Record<string, string>; variantId?: string; variantName?: string };
type CartContextType = { items: CartItem[]; demoMode: boolean; add: (product: Product, customization?: Record<string, string>, variant?: CartVariant, quantity?: number) => void; update: (lineId: string, amount: number) => void; remove: (lineId: string) => void; clear: () => void };
const CartContext = createContext<CartContextType | null>(null);
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside StoreShell"); return context; }
type WishlistContextType = { items: Product[]; demoMode: boolean; toggle: (product: Product) => void; has: (slug: string) => boolean };
const WishlistContext = createContext<WishlistContextType | null>(null);
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used inside StoreShell"); return context; }
const LocaleContext = createContext<Locale>("ar");
export function useLocale() { return useContext(LocaleContext); }
export function useTranslation() {
  const locale = useLocale();
  return (key: TranslationKey) => getTranslation(locale, key);
}

export function StoreShell({ children, demoMode = false, locale = "ar" }: { children: ReactNode; demoMode?: boolean; locale?: Locale }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(demoMode);
  const { status } = useSession();
  const mergedSession = useRef(false);

  useEffect(() => {
    if (demoMode) return;
    const savedCart = localStorage.getItem("stitch-cart");
    const savedWishlist = localStorage.getItem("stitch-wishlist");
    queueMicrotask(() => {
      if (savedCart) {
        const savedItems = JSON.parse(savedCart) as Omit<CartItem, "lineId">[];
        setItems(savedItems.reduce<CartItem[]>((normalized, item) => mergeCartLine(normalized, normalizeStoredCartLine({ ...item, image: getProductImageUrl(item.image) })), []));
      }
      if (savedWishlist) setWishlist((JSON.parse(savedWishlist) as Product[]).map(product => ({ ...product, image: getProductImageUrl(product.image) })));
      setCartLoaded(true);
    });
  }, [demoMode]);
  useEffect(() => {
    if (demoMode || !cartLoaded || status !== "authenticated" || mergedSession.current) return;
    mergedSession.current = true;
    Promise.all([
      fetch("/api/cart/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map(checkoutLinePayload) }) }),
      fetch("/api/wishlist/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slugs: wishlist.map(item => item.slug) }) }),
    ]).catch(() => undefined);
  }, [demoMode, cartLoaded, status, items, wishlist]);
  useEffect(() => { if (!demoMode) localStorage.setItem("stitch-wishlist", JSON.stringify(wishlist)); }, [demoMode, wishlist]);
  useEffect(() => { if (!demoMode) localStorage.setItem("stitch-cart", JSON.stringify(items)); }, [demoMode, items]);

  const add = (product: Product, customization?: Record<string, string>, variant?: CartVariant, quantity = 1) => {
    if (demoMode) return;
    const normalizedCustomization = normalizeCustomization(customization);
    const lineId = cartLineId({ slug: product.slug, variantId: variant?.id, customization: normalizedCustomization });
    setItems(current => {
      return mergeCartLine(current, { ...product, image: getProductImageUrl(product.image), lineId, quantity, customization: normalizedCustomization, variantId: variant?.id, variantName: variant?.name });
    });
    setCartOpen(true);
  };
  const update = (lineId: string, amount: number) => setItems(current => adjustCartLine(current, lineId, amount));
  const remove = (lineId: string) => setItems(current => removeCartLine(current, lineId));
  const clear = () => setItems([]);
  const toggle = (product: Product) => { if (demoMode) return; setWishlist(current => current.some(item => item.slug === product.slug) ? current.filter(item => item.slug !== product.slug) : [...current, { ...product, image: getProductImageUrl(product.image) }]); };

  return <LocaleContext.Provider value={locale}>
    <WishlistContext.Provider value={{ items: wishlist, demoMode, toggle, has: slug => wishlist.some(item => item.slug === slug) }}>
      <CartContext.Provider value={{ items, demoMode, add, update, remove, clear }}>
        <ScrollReveal />
        <Header count={items.reduce((sum, item) => sum + item.quantity, 0)} wishlistCount={wishlist.length} onCart={() => setCartOpen(true)} locale={locale} />
        {demoMode && <div className="daisy-demo-notice" role="status" dir={directionForLocale(locale)}><strong>{getTranslation(locale, "previewBannerTitle")}</strong><span>{getTranslation(locale, "previewBannerDescription")}</span></div>}
        {children}
        <Footer locale={locale} />
        {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      </CartContext.Provider>
    </WishlistContext.Provider>
  </LocaleContext.Provider>;
}

function Header({ count, wishlistCount, onCart, locale }: { count: number; wishlistCount: number; onCart: () => void; locale: Locale }) {
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!mobileOpen) return;
    const menuTrigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileMenuRef.current?.querySelector<HTMLElement>(".daisy-mobile-menu__top button")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !mobileMenuRef.current) return;
      const focusable = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuTrigger?.focus();
    };
  }, [mobileOpen]);
  useEffect(() => {
    if (!searchOpen) return;
    function closeSearchOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", closeSearchOnEscape);
    return () => document.removeEventListener("keydown", closeSearchOnEscape);
  }, [searchOpen]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
    setSearchOpen(false);
    setQuery("");
  };
  return <>
    <div className="daisy-announcement">{t("announcement")}</div>
    <header className="daisy-header">
      <div className="daisy-header__inner">
        <button ref={menuButtonRef} className="daisy-icon-button daisy-menu-toggle" aria-label={t("menuOpen")} aria-expanded={mobileOpen} aria-controls="daisy-mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={19} strokeWidth={1.5} /></button>
          <Link href="/" className="daisy-wordmark" aria-label={t("brandHome")}><BrandLogo variant="lockup" priority /></Link>
        <nav className="daisy-nav" aria-label={t("mainNavigation")}>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>{t("home")}</Link><Link href="/products" aria-current={pathname.startsWith("/products") ? "page" : undefined}>{t("products")}</Link><Link href="/categories" aria-current={pathname.startsWith("/categories") ? "page" : undefined}>{t("categories")}</Link><Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>{t("ourStory")}</Link><Link href="/faq" aria-current={pathname === "/faq" ? "page" : undefined}>{t("help")}</Link>
        </nav>
        <div className="daisy-tools">
          <button className="daisy-icon-button" aria-label={t("search")} aria-expanded={searchOpen} aria-controls="daisy-search-panel" onClick={() => setSearchOpen(value => !value)}><Search size={18} strokeWidth={1.5} /></button>
          <ThemeToggle locale={locale} />
          <LocaleSwitcher locale={locale} />
          <Link className="daisy-icon-button daisy-desktop-tool" href="/account" aria-label={t("account")}><UserRound size={18} strokeWidth={1.5} /></Link>
          <Link className="daisy-icon-button daisy-desktop-tool daisy-wishlist-link" href="/wishlist" aria-label={wishlistCount > 0 ? `${t("wishlist")}, ${wishlistCount}` : t("wishlist")}><Heart size={18} strokeWidth={1.5} />{wishlistCount > 0 && <span className="daisy-cart-count" aria-hidden="true">{wishlistCount}</span>}</Link>
          <button className="daisy-icon-button daisy-cart-button" onClick={onCart} aria-label={formatMessage(t("cartCount"), { count })}><ShoppingBag size={18} strokeWidth={1.5} />{count > 0 && <span className="daisy-cart-count">{count}</span>}</button>
        </div>
      </div>
      {searchOpen && <div id="daisy-search-panel" className="daisy-search-panel"><form onSubmit={submitSearch} role="search"><label htmlFor="daisy-search">{t("searchPrompt")}</label><div><input id="daisy-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} /><button type="submit" aria-label={t("submitSearch")}><ArrowLeft size={18} /></button></div></form><button className="daisy-search-close" onClick={() => setSearchOpen(false)} aria-label={t("searchClose")}><X size={18} /></button></div>}
    </header>
    {mobileOpen && <div ref={mobileMenuRef} id="daisy-mobile-menu" className="daisy-mobile-menu" role="dialog" aria-modal="true" aria-label={t("siteMenu")}><div className="daisy-mobile-menu__top"><Link href="/" className="daisy-wordmark" aria-label={t("brandHome")} onClick={() => setMobileOpen(false)}><BrandLogo variant="lockup" /></Link><button className="daisy-icon-button" onClick={() => setMobileOpen(false)} aria-label={t("menuClose")}><X size={20} /></button></div><nav aria-label={t("mainNavigation")}><Link href="/" aria-current={pathname === "/" ? "page" : undefined} onClick={() => setMobileOpen(false)}>{t("home")}</Link><Link href="/products" aria-current={pathname.startsWith("/products") ? "page" : undefined} onClick={() => setMobileOpen(false)}>{t("products")}</Link><Link href="/categories" aria-current={pathname.startsWith("/categories") ? "page" : undefined} onClick={() => setMobileOpen(false)}>{t("categories")}</Link><Link href="/about" aria-current={pathname === "/about" ? "page" : undefined} onClick={() => setMobileOpen(false)}>{t("ourStory")}</Link><Link href="/faq" aria-current={pathname === "/faq" ? "page" : undefined} onClick={() => setMobileOpen(false)}>{t("help")}</Link></nav><div className="daisy-mobile-menu__utilities"><Link href="/account">{t("myAccount")}</Link><Link href="/wishlist">{t("wishlist")}{wishlistCount > 0 && <span className="daisy-mobile-wishlist-count" aria-label={`${wishlistCount}`}> ({wishlistCount})</span>}</Link><button onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>{t("searchProduct")}</button><div className="daisy-mobile-menu__preferences"><ThemeToggle locale={locale} /><LocaleSwitcher locale={locale} compact /></div></div></div>}
  </>;
}

export function ProductCard({ product, editorial = false }: { product: Product; editorial?: boolean }) {
  const { add, demoMode } = useCart();
  const t = useTranslation();
  const locale = useLocale();
  const image = getProductImageUrl(product.image);
  return <article data-scroll-reveal suppressHydrationWarning className={`daisy-product ${editorial ? "daisy-product--editorial" : ""}`}>
    <div className="daisy-product__media">
      <Link href={`/products/${product.slug}`} aria-label={formatMessage(t("viewProduct"), { name: product.name })} className="daisy-product__image-link"><Image src={image} alt={product.name} fill sizes="(max-width: 760px) 50vw, 25vw" className={`daisy-image daisy-product__image ${image === PRODUCT_IMAGE_PLACEHOLDER ? "daisy-product__image--placeholder" : ""}`} /></Link>
      {!demoMode && <WishlistButton product={product} />}
      {product.badge && <span className="daisy-product__badge">{product.badge}</span>}
      {editorial && <Link href={`/products/${product.slug}`} className="daisy-product__quick">{t("customizeNow")} {locale === "ar" ? <ArrowUpLeft size={15} /> : <ArrowUpRight size={15} />}</Link>}
    </div>
    <div className="daisy-product__meta"><div><p className="daisy-product__category">{product.category}</p><Link href={`/products/${product.slug}`} className="daisy-product__name">{product.name}</Link>{editorial && product.customizable && <span className="daisy-product__personalized">{t("customizable")}</span>}</div><span className="daisy-product__price">{formatPrice(product.price, locale)}</span></div>
    {!editorial && (demoMode ? <span className="daisy-product__add daisy-product__demo-label">{t("previewOnly")}</span> : product.customizable || product.hasVariants ? <Link href={`/products/${product.slug}`} className="daisy-product__add">{t("chooseDetails")} {locale === "ar" ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Link> : <button onClick={() => add(product)} className="daisy-product__add">{t("addToCart")} <Plus size={14} /></button>)}
  </article>;
}

export function WishlistButton({ product }: { product: Product }) {
  const { toggle, has, demoMode } = useWishlist();
  const t = useTranslation();
  if (demoMode) return null;
  return <button onClick={event => { event.preventDefault(); event.stopPropagation(); toggle({ ...product, image: getProductImageUrl(product.image) }); }} aria-label={has(product.slug) ? t("removeFromWishlist") : t("addToWishlist")} className="daisy-wishlist-button"><Heart size={17} strokeWidth={1.5} fill={has(product.slug) ? "currentColor" : "none"} /></button>;
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, update, remove, demoMode } = useCart();
  const t = useTranslation();
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div className="daisy-drawer-backdrop" onClick={onClose}><aside onClick={event => event.stopPropagation()} className="daisy-cart-drawer" aria-label={t("cartDrawer")}><div className="daisy-cart-drawer__head"><h2>{t("cartDrawer")} <span>({items.length})</span></h2><button className="daisy-icon-button" onClick={onClose} aria-label={t("cartClose")}><X size={20} /></button></div><div className="daisy-cart-drawer__body">{items.length === 0 ? <div className="daisy-cart-empty"><ShoppingBag size={25} strokeWidth={1.2} /><p>{demoMode ? t("previewNoPurchase") : t("emptyCart")}</p></div> : items.map(item => <div key={item.lineId} className="daisy-cart-item"><div className="daisy-cart-item__image"><Image src={getProductImageUrl(item.image)} alt={item.name} fill sizes="76px" className="daisy-image" /></div><div className="daisy-cart-item__info"><div><p>{item.name}</p>{item.variantName && <small>{item.variantName}</small>}{item.customization && Object.entries(item.customization).map(([key, value]) => <small key={key}>{key}: {value}</small>)}</div><div className="daisy-cart-item__controls"><div><button onClick={() => update(item.lineId, -1)} aria-label={t("decreaseQuantity")}><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => update(item.lineId, 1)} aria-label={t("increaseQuantity")}><Plus size={12} /></button></div><button className="daisy-remove" onClick={() => remove(item.lineId)}>{t("remove")}</button><span>{formatPrice(item.price * item.quantity, locale)}</span></div></div></div>)}</div><div className="daisy-cart-drawer__foot">{demoMode ? <p className="daisy-demo-cart-message">{t("previewCartMessage")}</p> : <><div><span>{t("total")}</span><strong>{formatPrice(total, locale)}</strong></div><Link href="/checkout" onClick={onClose} className="daisy-button daisy-button--dark">{t("checkout")} <Arrow size={16} /></Link></>}<Link href="/cart" onClick={onClose} className="daisy-cart-view-link">{t("viewCart")}</Link></div></aside></div>;
}

function Footer({ locale }: { locale: Locale }) {
  const t = (key: TranslationKey) => getTranslation(locale, key);
  return <footer className="daisy-footer" data-scroll-reveal suppressHydrationWarning><div className="daisy-footer__main"><div className="daisy-footer__brand"><Link href="/" className="daisy-wordmark daisy-wordmark--footer" aria-label={t("brandHome")}><BrandLogo variant="full" /></Link><p>{t("footerIntro")}<br />{t("footerIntroSecond")}</p></div><div className="daisy-footer__links"><div><h2>{t("discover")}</h2><Link href="/categories">{t("categories")}</Link><Link href="/products">{t("products")}</Link><Link href="/about">{t("ourStory")}</Link><Link href="/faq">{t("help")}</Link></div><div><h2>{t("hereForYou")}</h2><Link href="/faq">{t("frequentlyAskedQuestions")}</Link><Link href="/shipping">{t("shippingDelivery")}</Link><Link href="/returns">{t("returns")}</Link><Link href="/contact">{t("contactUs")}</Link></div><div><h2>{t("followUs")}</h2><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></div></div></div><div className="daisy-footer__bottom"><span>{t("copyright")}</span><span>{t("madeWithLove")}</span><Link href="/privacy">{t("privacyTerms")}</Link></div></footer>;
}
