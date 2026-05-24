export const MIN_ORDER_AMOUNT = 1000;
export const SHIPPING_FEE = 200;
export const ONLINE_DISCOUNT_PERCENT = 5;

export function calculateOrderTotals(
  subtotal: number,
  paymentMethod: "cod" | "online"
) {
  const shipping = SHIPPING_FEE;
  const discountPercent =
    paymentMethod === "online" ? ONLINE_DISCOUNT_PERCENT : 0;
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal + shipping - discount;

  return { subtotal, shipping, discount, discountPercent, total };
}
