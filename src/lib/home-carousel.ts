export type CarouselDirection = "rtl" | "ltr";
export type CarouselAction = "next" | "previous";

export function getCarouselScrollDelta(
  direction: CarouselDirection,
  action: CarouselAction,
  viewportWidth: number,
) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return 0;

  const distance = Math.round(viewportWidth * 0.82);
  const directionSign = direction === "rtl" ? -1 : 1;
  const actionSign = action === "next" ? 1 : -1;

  return distance * directionSign * actionSign;
}
