"use client";

import { useEffect } from "react";
import { getScrollRevealDelay, parseCustomRevealDelay } from "@/lib/scroll-reveal";

const TARGET_SELECTOR = "[data-scroll-reveal]";
const STAGGER_SELECTOR = "[data-scroll-reveal-stagger]";

function revealDelay(element: Element) {
  const customDelay = element.getAttribute("data-scroll-reveal-delay");
  if (customDelay !== null) {
    return parseCustomRevealDelay(customDelay, 0);
  }
  const group = element.closest(STAGGER_SELECTOR);
  if (!group) return 0;
  const index = Array.from(group.querySelectorAll(TARGET_SELECTOR)).indexOf(element);
  return getScrollRevealDelay(index);
}

export function ScrollReveal() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches || !("IntersectionObserver" in window) || typeof Element.prototype.animate !== "function") return;

    let stopped = false;
    const revealed = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const revealTarget = (element: HTMLElement, isInstant: boolean) => {
      if (revealed.has(element)) return;
      revealed.add(element);
      observer.unobserve(element);
      element.setAttribute("data-scroll-revealed", "true");

      if (isInstant) return;

      try {
        const animation = element.animate(
          [{ opacity: 0, transform: "translate3d(0, 12px, 0)" }, { opacity: 1, transform: "translate3d(0, 0, 0)" }],
          { duration: 520, delay: revealDelay(element), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
        );
        animations.add(animation);
        animation.onfinish = () => {
          animations.delete(animation);
          animation.cancel();
        };
      } catch {
        element.setAttribute("data-scroll-revealed", "true");
      }
    };

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (revealed.has(entry.target)) continue;
        const rect = entry.boundingClientRect;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const isAtOrAboveViewport = rect.top <= viewportHeight;
        if (!entry.isIntersecting && !isAtOrAboveViewport) continue;
        revealTarget(entry.target as HTMLElement, rect.bottom < 0);
      }
    }, { rootMargin: "0px 0px 50px 0px", threshold: 0.01 });

    const observe = (root: ParentNode) => {
      root.querySelectorAll(TARGET_SELECTOR).forEach(element => {
        if (!revealed.has(element)) observer.observe(element);
      });
    };
    observe(document);

    const revealFocusedTarget = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest(TARGET_SELECTOR);
      if (!element || !(element instanceof HTMLElement)) return;
      revealTarget(element, false);
    };
    document.addEventListener("focusin", revealFocusedTarget);

    const checkVisibleElements = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll(`${TARGET_SELECTOR}:not([data-scroll-revealed="true"])`).forEach(el => {
        if (!(el instanceof HTMLElement) || revealed.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportHeight + 80) {
          revealTarget(el, rect.bottom < 0);
        }
      });
    };

    // Mark viewport and near-fold elements before enabling the hidden styles
    checkVisibleElements();
    document.documentElement.setAttribute("data-scroll-reveal-ready", "true");

    let scrollScheduled = false;
    const onScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        scrollScheduled = false;
        checkVisibleElements();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const mutationObserver = new MutationObserver(records => {
      for (const record of records) record.addedNodes.forEach(node => {
        if (node instanceof Element) {
          if (node.matches(TARGET_SELECTOR) && !revealed.has(node)) observer.observe(node);
          observe(node);
        }
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches || stopped) return;
      stopped = true;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      window.removeEventListener("scroll", onScroll);
      mutationObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("focusin", revealFocusedTarget);
      document.documentElement.removeAttribute("data-scroll-reveal-ready");
      document.querySelectorAll(`${TARGET_SELECTOR}[data-scroll-revealed]`).forEach(element => element.removeAttribute("data-scroll-revealed"));
    };
    motionPreference.addEventListener("change", handleMotionChange);

    return () => {
      stopped = true;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      window.removeEventListener("scroll", onScroll);
      motionPreference.removeEventListener("change", handleMotionChange);
      document.removeEventListener("focusin", revealFocusedTarget);
      mutationObserver.disconnect();
      observer.disconnect();
      document.documentElement.removeAttribute("data-scroll-reveal-ready");
      document.querySelectorAll(`${TARGET_SELECTOR}[data-scroll-revealed]`).forEach(element => element.removeAttribute("data-scroll-revealed"));
    };
  }, []);

  return null;
}
