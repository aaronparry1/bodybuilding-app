export const tabBarBaseHeight = 68;
export const tabBarTopPadding = 8;
export const tabScreenBottomGap = 40;

export function getTabBarHeight(bottomInset: number): number {
  return tabBarBaseHeight + Math.max(bottomInset, 10);
}

export function getTabScreenBottomPadding(bottomInset: number): number {
  return getTabBarHeight(bottomInset) + tabScreenBottomGap;
}
