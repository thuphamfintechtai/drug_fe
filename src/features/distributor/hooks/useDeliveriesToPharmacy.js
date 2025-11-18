import { useEffect, useState } from "react";
import { distributorQueries } from "../apis/distributor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    default:
      return "blue";
  }
};

export const statusLabel = (status) => {
  const labels = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export const useDeliveriesToPharmacy = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: fetchDeliveries } =
    distributorQueries.getDeliveriesToPharmacy();
  const { mutateAsync: updatePharmacyDeliveryStatusMutation } =
    distributorQueries.updatePharmacyDeliveryStatus();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchDeliveries();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setData(list);
    } catch (error) {
      console.error("Fetch deliveries error:", error);
      toast.error("Không tải được danh sách!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id) => {
    try {
      await updatePharmacyDeliveryStatusMutation({
        id,
        data: { status: "confirmed" },
      });
      toast.success("Cập nhật thành công!");
      fetchData();
    } catch (error) {
      console.error("Update delivery status error:", error);
      toast.error("Cập nhật lỗi!");
    }
  };

  return {
    data,
    loading,
    updateStatus,
    fetchData,
  };
};
