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

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";
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
