export type SafeArea = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

const readCssInset = (variable: string): number => {
  if (typeof window === "undefined") return 0;

  const root = document.documentElement;
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.pointerEvents = "none";
  probe.style.visibility = "hidden";
  probe.style.top = `env(${variable}, 0px)`;
  root.appendChild(probe);
  const value = Number.parseFloat(getComputedStyle(probe).top);
  probe.remove();

  return Number.isFinite(value) ? value : 0;
};

/**
 * Layout-safe content rectangle.
 * The canvas itself remains full-bleed; gameplay/UI uses this rectangle.
 */
export const getSafeArea = (width: number, height: number): SafeArea => {
  const cssTop = readCssInset("safe-area-inset-top");
  const cssRight = readCssInset("safe-area-inset-right");
  const cssBottom = readCssInset("safe-area-inset-bottom");
  const cssLeft = readCssInset("safe-area-inset-left");

  const horizontalMargin = Math.max(18, Math.round(width * 0.045));
  const topChrome = Math.max(72, Math.round(height * 0.09));
  const bottomMargin = Math.max(18, Math.round(height * 0.035));

  const left = Math.max(horizontalMargin, cssLeft + 12);
  const right = Math.max(horizontalMargin, cssRight + 12);
  const top = Math.max(topChrome, cssTop + topChrome);
  const bottom = Math.max(bottomMargin, cssBottom + bottomMargin);

  return {
    left,
    right,
    top,
    bottom,
    width: Math.max(1, width - left - right),
    height: Math.max(1, height - top - bottom),
    centerX: width / 2,
    centerY: (top + height - bottom) / 2,
  };
};
