export const removeVietnameseAccents = (str) => {
  if (!str) {
    return "";
  }
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "");
};

export const formatDate = (d) => {
  if (!d) {
    return "N/A";
  }
  const date = new Date(d);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
};
export const short = (s) => {
  if (!s || typeof s !== "string") {
    return "N/A";
  }
  if (s.length <= 12) {
    return s;
  }
  return `${s.slice(0, 8)}...${s.slice(-4)}`;
};
export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

export const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") : value ?? "—";
export const shortenTx = (hash) =>
  hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : "";
export const formatAddress = (address) => {
  if (!address) {
    return "";
  }
  if (typeof address === "string") {
    return address;
  }
  const parts = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ");
  return parts || "";
};
