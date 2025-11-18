/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";
import { toast } from "sonner";

export const useCreateProofToPharmacy = () => {
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [fetchingPharmacy, setFetchingPharmacy] = useState(true);
  const [fetchingDistribution, setFetchingDistribution] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutateAsync: createProofToPharmacyMutation } =
    distributorQueries.createProofToPharmacy();
  const { mutateAsync: fetchDistributionsMutation } =
    distributorQueries.getDistributions();
  const { mutateAsync: fetchAllPharmacies } =
    distributorQueries.getPharmacies();

  // Lấy danh sách Proof of Distribution đã confirmed
  useEffect(() => {
    async function loadDistributions() {
      setFetchingDistribution(true);
      try {
        const res = await fetchDistributionsMutation();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        // Chỉ lấy những đơn đã confirmed
        const confirmed = list.filter((d) => d.status === "confirmed");
        setDistributions(confirmed);
      } catch (error) {
        toast.error("Không tải được danh sách đơn phân phối");
      } finally {
        setFetchingDistribution(false);
      }
    }
    loadDistributions();
  }, [fetchDistributionsMutation]);

  useEffect(() => {
    async function loadPharmacies() {
      setFetchingPharmacy(true);
      try {
        const res = await fetchAllPharmacies({ limit: 1000 });
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setPharmacies(
          list.map((p) => ({
            value: p._id || p.userId,
            label:
              p.pharmacyName || p.name || p.fullName || p.username || "N/A",
          }))
        );
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        toast.error("Không tải được danh sách nhà thuốc");
      } finally {
        setFetchingPharmacy(false);
      }
    }
    loadPharmacies();
  }, [fetchAllPharmacies]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const selectedDist = distributions.find(
        (d) => d._id === values.proofOfDistributionId
      );
      if (!selectedDist) {
        toast.error("Đơn phân phối không hợp lệ");
        setLoading(false);
        return;
      }

      const drug =
        selectedDist.drug ||
        selectedDist.proofOfProduction?.drug ||
        selectedDist.nftInfo?.drug;
      const drugId =
        drug?._id ||
        selectedDist.drug?._id ||
        selectedDist.proofOfProduction?.drug?._id ||
        selectedDist.nftInfo?.drug?._id;

      if (!drugId) {
        toast.error("Không tìm thấy thông tin thuốc trong đơn phân phối");
        setLoading(false);
        return;
      }

      const payload = {
        toPharmacyId: values.toPharmacyId,
        proofOfDistributionId: values.proofOfDistributionId,
        nftInfoId: selectedDist.nftInfo?._id || selectedDist.nftInfo,
        drugId: drugId,
        deliveredQuantity: values.deliveredQuantity,
        deliveryAddress: values.deliveryAddress || "",
        estimatedDelivery: values.estimatedDelivery || null,
        notes: values.notes || "",
      };
      await createProofToPharmacyMutation(payload);
      toast.success("Tạo đơn giao thành công!");
      form.resetFields();
      setTimeout(() => navigate("/distributor/deliveries"), 2000);
    } catch (error) {
      console.error("Create Proof error:", error);
      toast.error("Tạo đơn thất bại!", {
        description: error.response?.data?.message || "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    pharmacies,
    distributions,
    fetchingPharmacy,
    fetchingDistribution,
    form,
    onFinish,
  };
};
