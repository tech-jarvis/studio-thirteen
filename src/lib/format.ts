export function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ST${y}${m}${d}${rand}`;
}
