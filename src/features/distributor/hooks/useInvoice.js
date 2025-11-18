import { useEffect, useState } from "react";
import { distributorQueries } from "../apis/distributor";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useInvoices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: fetchMyInvoices } = distributorQueries.getMyInvoices();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchMyInvoices();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setData(list);
    } catch (error) {
      console.error("Invoice fetch error:", error);
      toast.error("Không tải được danh sách hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
