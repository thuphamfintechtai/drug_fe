/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import {
  useCreateInvoice,
  useDistributorDeliveriesToPharmacy,
} from "../apis/distributor";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";

export const useInvoiceCreate = () => {
  const [loading, setLoading] = useState(false);
  const [proofOfPharmacies, setProofOfPharmacies] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);
  const [fetchingProofs, setFetchingProofs] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();
  const { data: deliveriesData } = useDistributorDeliveriesToPharmacy();

  // Lấy danh sách Proof of Pharmacy đã có (chưa có invoice)
  useEffect(() => {
    async function fetchProofs() {
      setFetchingProofs(true);
      try {
        const response = await api.get("/distributor/deliveries");
        const res = response.data?.data || response.data;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : Array.isArray(deliveriesData?.data)
          ? deliveriesData.data
          : Array.isArray(deliveriesData?.data?.data)
          ? deliveriesData.data.data
          : [];
        // Chỉ lấy những đơn đã confirmed và chưa có commercial invoice
        const available = list.filter(
          (p) =>
            p.status === "confirmed" &&
            !p.commercialInvoice &&
            !p.commercialInvoiceId
        );
        setProofOfPharmacies(available);
      } catch (error) {
        toast.error("Không tải được danh sách đơn giao hàng");
      } finally {
        setFetchingProofs(false);
      }
    }
    fetchProofs();
  }, [deliveriesData]);

  const onFinish = async (values) => {
    if (!selectedProof) {
      toast.error("Vui lòng chọn đơn giao hàng");
      return;
    }

    setLoading(true);
    try {
      await createInvoiceMutation.mutateAsync({
        proofOfPharmacyId: selectedProof._id,
        unitPrice: values.unitPrice,
        paymentMethod: values.paymentMethod || "bank_transfer",
        notes: values.notes || "",
      });
      toast.success("Tạo hóa đơn thành công!");
      form.resetFields();
      setSelectedProof(null);
      setTimeout(() => navigate("/distributor/invoices"), 2000);
    } catch (error) {
      console.error("Create invoice error:", error);
      toast.error("Tạo hóa đơn thất bại!", {
        description: error.response?.data?.message || "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };
};
