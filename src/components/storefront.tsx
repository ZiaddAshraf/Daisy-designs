"use client";

import Image from "@/components/site-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpLeft, Heart, Menu, Minus, Plus, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { normalizeCustomization } from "@/lib/commerce-rules";
import { adjustCartLine, cartLineId, checkoutLinePayload, mergeCartLine, normalizeStoredCartLine, removeCartLine } from "@/lib/cart-line-state";

type CartVariant = { id: string; name: string; stock: number };
type CartItem = Product & { lineId: string; quantity: number; customization?: Record<string, string>; variantId?: string; variantName?: string };
type CartContextType = { items: CartItem[]; add: (product: Product, customization?: Record<string, string>, variant?: CartVariant, quantity?: number) => void; update: (lineId: string, amount: number) => void; remove: (lineId: string) => void; clear: () => void };
const CartContext = createContext<CartContextType | null>(null);
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside StoreShell"); return context; }
type WishlistContextType = { items: Product[]; toggle: (product: Product) => void; has: (slug: string) => boolean };
const WishlistContext = createContext<WishlistContextType | null>(null);
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used inside StoreShell"); return context; }

export function StoreShell({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const { status } = useSession();
  const mergedSession = useRef(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("stitch-cart");
    const savedWishlist = localStorage.getItem("stitch-wishlist");
    queueMicrotask(() => {
      if (savedCart) {
        const savedItems = JSON.parse(savedCart) as Omit<CartItem, "lineId">[];
        setItems(savedItems.reduce<CartItem[]>((normalized, item) => mergeCartLine(normalized, normalizeStoredCartLine(item)), []));
      }
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist) as Product[]);
      setCartLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (!cartLoaded || status !== "authenticated" || mergedSession.current) return;
    mergedSession.current = true;
    Promise.all([
      fetch("/api/cart/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map(checkoutLinePayload) }) }),
      fetch("/api/wishlist/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slugs: wishlist.map(item => item.slug) }) }),
    ]).catch(() => undefined);
  }, [cartLoaded, status, items, wishlist]);
  useEffect(() => { localStorage.setItem("stitch-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem("stitch-cart", JSON.stringify(items)); }, [items]);

  const add = (product: Product, customization?: Record<string, string>, variant?: CartVariant, quantity = 1) => {
    const normalizedCustomization = normalizeCustomization(customization);
    const lineId = cartLineId({ slug: product.slug, variantId: variant?.id, customization: normalizedCustomization });
    setItems(current => {
      return mergeCartLine(current, { ...product, lineId, quantity, customization: normalizedCustomization, variantId: variant?.id, variantName: variant?.name });
    });
    setCartOpen(true);
  };
  const update = (lineId: string, amount: number) => setItems(current => adjustCartLine(current, lineId, amount));
  const remove = (lineId: string) => setItems(current => removeCartLine(current, lineId));
  const clear = () => setItems([]);
  const toggle = (product: Product) => setWishlist(current => current.some(item => item.slug === product.slug) ? current.filter(item => item.slug !== product.slug) : [...current, product]);

  return <WishlistContext.Provider value={{ items: wishlist, toggle, has: slug => wishlist.some(item => item.slug === slug) }}>
    <CartContext.Provider value={{ items, add, update, remove, clear }}>
      <Header count={items.reduce((sum, item) => sum + item.quantity, 0)} onCart={() => setCartOpen(true)} />
      {children}
      <Footer />
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </CartContext.Provider>
  </WishlistContext.Provider>;
}

function Header({ count, onCart }: { count: number; onCart: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
    setSearchOpen(false);
    setQuery("");
  };
  return <>
    <div className="daisy-announcement">شحن مجاني للطلبات فوق ٢٬٥٠٠ جنيه</div>
    <header className="daisy-header">
      <div className="daisy-header__inner">
        <button className="daisy-icon-button daisy-menu-toggle" aria-label="فتح القائمة" onClick={() => setMobileOpen(true)}><Menu size={19} strokeWidth={1.5} /></button>
        <Link href="/" className="daisy-wordmark" aria-label="Daisy Designs، الرئيسية">DAISY <span>DESIGNS</span></Link>
        <nav className="daisy-nav" aria-label="التنقل الرئيسي">
          <Link href="/">الرئيسية</Link><Link href="/products">المنتجات</Link><Link href="/collections">المجموعات</Link><Link href="/about">قصتنا</Link><Link href="/faq">المساعدة</Link>
        </nav>
        <div className="daisy-tools">
          <button className="daisy-icon-button" aria-label="البحث" onClick={() => setSearchOpen(value => !value)}><Search size={18} strokeWidth={1.5} /></button>
          <Link className="daisy-icon-button daisy-desktop-tool" href="/account" aria-label="الحساب"><UserRound size={18} strokeWidth={1.5} /></Link>
          <Link className="daisy-icon-button daisy-desktop-tool" href="/wishlist" aria-label="المفضلة"><Heart size={18} strokeWidth={1.5} /></Link>
          <button className="daisy-icon-button daisy-cart-button" onClick={onCart} aria-label={`السلة، ${count} منتجات`}><ShoppingBag size={18} strokeWidth={1.5} />{count > 0 && <span className="daisy-cart-count">{count}</span>}</button>
        </div>
      </div>
      {searchOpen && <div className="daisy-search-panel"><form onSubmit={submitSearch} role="search"><label htmlFor="daisy-search">ابحثي عن شيء يخصهم</label><div><input id="daisy-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="اسم المنتج أو القسم" /><button type="submit" aria-label="تنفيذ البحث"><ArrowLeft size={18} /></button></div></form><button className="daisy-search-close" onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث"><X size={18} /></button></div>}
      {mobileOpen && <div className="daisy-mobile-menu" role="dialog" aria-modal="true" aria-label="قائمة الموقع"><div className="daisy-mobile-menu__top"><Link href="/" className="daisy-wordmark">DAISY <span>DESIGNS</span></Link><button className="daisy-icon-button" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><X size={20} /></button></div><nav><Link href="/" onClick={() => setMobileOpen(false)}>الرئيسية</Link><Link href="/products" onClick={() => setMobileOpen(false)}>المنتجات</Link><Link href="/collections" onClick={() => setMobileOpen(false)}>المجموعات</Link><Link href="/about" onClick={() => setMobileOpen(false)}>قصتنا</Link><Link href="/faq" onClick={() => setMobileOpen(false)}>المساعدة</Link></nav><div className="daisy-mobile-menu__utilities"><Link href="/account">حسابي</Link><Link href="/wishlist">المفضلة</Link><button onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>ابحثي عن منتج</button></div></div>}
    </header>
  </>;
}

export function ProductCard({ product, editorial = false }: { product: Product; editorial?: boolean }) {
  const { add } = useCart();
  return <article className={`daisy-product ${editorial ? "daisy-product--editorial" : ""}`}>
    <div className="daisy-product__media">
      <Link href={`/products/${product.slug}`} aria-label={`عرض ${product.name}`} className="daisy-product__image-link"><Image src={product.image} alt={product.name} fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image daisy-product__image" /></Link>
      <WishlistButton product={product} />
      {product.badge && <span className="daisy-product__badge">{product.badge}</span>}
      {editorial && <Link href={`/products/${product.slug}`} className="daisy-product__quick">خصص الآن <ArrowUpLeft size={15} /></Link>}
    </div>
    <div className="daisy-product__meta"><div><p className="daisy-product__category">{product.category}</p><Link href={`/products/${product.slug}`} className="daisy-product__name">{product.name}</Link>{editorial && product.customizable && <span className="daisy-product__personalized">قابل للتخصيص</span>}</div><span className="daisy-product__price">{formatPrice(product.price)}</span></div>
    {!editorial && (product.customizable || product.hasVariants ? <Link href={`/products/${product.slug}`} className="daisy-product__add">اختاري التفاصيل <ArrowLeft size={14} /></Link> : <button onClick={() => add(product)} className="daisy-product__add">أضف إلى السلة <Plus size={14} /></button>)}
  </article>;
}

export function WishlistButton({ product }: { product: Product }) {
  const { toggle, has } = useWishlist();
  return <button onClick={event => { event.preventDefault(); event.stopPropagation(); toggle(product); }} aria-label={has(product.slug) ? "إزالة من المفضلة" : "إضافة للمفضلة"} className="daisy-wishlist-button"><Heart size={17} strokeWidth={1.5} fill={has(product.slug) ? "currentColor" : "none"} /></button>;
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, update, remove } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div className="daisy-drawer-backdrop" onClick={onClose}><aside onClick={event => event.stopPropagation()} className="daisy-cart-drawer" aria-label="سلة التسوق"><div className="daisy-cart-drawer__head"><h2>سلة التسوق <span>({items.length})</span></h2><button className="daisy-icon-button" onClick={onClose} aria-label="إغلاق السلة"><X size={20} /></button></div><div className="daisy-cart-drawer__body">{items.length === 0 ? <div className="daisy-cart-empty"><ShoppingBag size={25} strokeWidth={1.2} /><p>السلة فارغة حاليًا</p></div> : items.map(item => <div key={item.lineId} className="daisy-cart-item"><div className="daisy-cart-item__image"><Image src={item.image} alt={item.name} fill sizes="76px" className="daisy-image" /></div><div className="daisy-cart-item__info"><div><p>{item.name}</p>{item.variantName && <small>{item.variantName}</small>}{item.customization && Object.entries(item.customization).map(([key, value]) => <small key={key}>{key}: {value}</small>)}</div><div className="daisy-cart-item__controls"><div><button onClick={() => update(item.lineId, -1)} aria-label="تقليل الكمية"><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => update(item.lineId, 1)} aria-label="زيادة الكمية"><Plus size={12} /></button></div><button className="daisy-remove" onClick={() => remove(item.lineId)}>حذف</button><span>{formatPrice(item.price * item.quantity)}</span></div></div></div>)}</div><div className="daisy-cart-drawer__foot"><div><span>الإجمالي</span><strong>{formatPrice(total)}</strong></div><Link href="/checkout" onClick={onClose} className="daisy-button daisy-button--dark">إتمام الطلب <ArrowLeft size={16} /></Link><Link href="/cart" onClick={onClose} className="daisy-cart-view-link">عرض السلة</Link></div></aside></div>;
}

function Footer() {
  return <footer className="daisy-footer"><div className="daisy-footer__main"><div className="daisy-footer__brand"><Link href="/" className="daisy-wordmark daisy-wordmark--footer">DAISY <span>DESIGNS</span></Link><p>منتجات مخصصة للأطفال،<br />بتفاصيل صنعت خصيصًا لهم.</p></div><div className="daisy-footer__links"><div><h2>اكتشفي</h2><Link href="/products">المتجر</Link><Link href="/products">المنتجات</Link><Link href="/collections">المجموعات</Link><Link href="/about">قصتنا</Link></div><div><h2>نحن هنا</h2><Link href="/faq">الأسئلة الشائعة</Link><Link href="/shipping">الشحن والتوصيل</Link><Link href="/returns">الاستبدال والاسترجاع</Link><Link href="/contact">تواصل معنا</Link></div><div><h2>تابعينا</h2><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></div></div></div><div className="daisy-footer__bottom"><span>© ٢٠٢٦ DAISY DESIGNS</span><span>صُنع بحب في مصر</span><Link href="/privacy">الخصوصية والشروط</Link></div></footer>;
}
