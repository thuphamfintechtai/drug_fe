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

export const useDistributions = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { mutateAsync: fetchDistributions } =
    distributorQueries.getDistributions();
  const { mutateAsync: confirmDistributionMutation } =
    distributorQueries.confirmDistribution();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchDistributions();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setData(list);
      setFilteredData(list);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không tải được danh sách lô hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) => {
      const drug =
        item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
      const drugName = drug?.name || drug?.tradeName || item.drugName || "";
      return (
        item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        drugName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.verificationCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, data]);

  const onConfirm = async (id) => {
    try {
      await confirmDistributionMutation(id);
      toast.success("Xác nhận nhận lô hàng thành công!");
      fetchData();
    } catch {
      toast.error("Xác nhận thất bại!");
    }
  };

  return {
    loading,
    filteredData,
    searchText,
    setSearchText,
    onConfirm,
    
  };
};
