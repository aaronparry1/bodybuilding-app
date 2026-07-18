export const tabBarBaseHeight = 54;
export const tabBarTopPadding = 4;
export const tabScreenBottomGap = 16;

export function getTabBarHeight(bottomInset: number): number {
  return tabBarBaseHeight + Math.max(bottomInset, 6);
}

export function getTabScreenBottomPadding(bottomInset: number): number {
  return getTabBarHeight(bottomInset) + tabScreenBottomGap;
}
