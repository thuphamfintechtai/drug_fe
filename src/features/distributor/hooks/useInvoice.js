import { distributorQueries } from "../apis/distributor";

export const useInvoices = () => {
  const {
    data: invoicesData,
    isLoading: loading,
    refetch: fetchData,
  } = distributorQueries.getMyInvoices();

  const data = Array.isArray(invoicesData?.data)
    ? invoicesData.data
    : Array.isArray(invoicesData?.data?.data)
    ? invoicesData.data.data
    : invoicesData?.data
    ? [invoicesData.data]
    : [];

  const statusColor = (status) => {
    const colors = {
      paid: "green",
      pending: "orange",
      draft: "blue",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const statusLabel = (status) => {
    const labels = {
      paid: "Đã thanh toán",
      pending: "Chờ thanh toán",
      draft: "Bản nháp",
      cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  return {
    data,
    loading,
    fetchData,
    statusColor,
    statusLabel,
  };
};
