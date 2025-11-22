import {
  useDistributorDeliveriesToPharmacy,
  useUpdatePharmacyDeliveryStatus,
} from "../apis/distributor";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const {
    data: deliveriesData,
    isLoading: loading,
    refetch: fetchData,
  } = useDistributorDeliveriesToPharmacy();
  const updatePharmacyDeliveryStatusMutation = useUpdatePharmacyDeliveryStatus();

  const data = Array.isArray(deliveriesData?.data)
    ? deliveriesData.data
    : Array.isArray(deliveriesData?.data?.data)
    ? deliveriesData.data.data
    : deliveriesData?.data
    ? [deliveriesData.data]
    : [];

  const updateStatus = async (id) => {
    try {
      await updatePharmacyDeliveryStatusMutation.mutateAsync({
        id,
        data: { status: "confirmed" },
      });
      toast.success("Cập nhật thành công!");
      queryClient.invalidateQueries(["getDeliveriesToPharmacy"]);
      fetchData();
    } catch {
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
