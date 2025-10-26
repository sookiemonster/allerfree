import type { MenuItem } from "../../types";

export function itemIsSafe(item: MenuItem) {
  return !item.contains.find((pred) => !pred.safe_to_eat);
}
