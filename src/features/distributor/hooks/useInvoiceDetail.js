import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUpdateInvoiceStatus } from "../apis/distributor";
import { Form } from "antd";
import { toast } from "sonner";
import api from "../../utils/api";

export const useInvoiceDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/distributor/invoices/${id}/detail`);
      const res = response.data?.data || response.data;
      const detail = res?.data?.data ? res.data.data : res?.data || res || null;
      setData(detail);
      if (detail) {
        form.setFieldsValue({
          status: detail.status || "draft",
          notes: detail.notes || "",
        });
      }
    } catch (error) {
      toast.error("Không tải được chi tiết hóa đơn");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const onStatusUpdate = async (values) => {
    setUpdating(true);
    try {
      await updateInvoiceStatusMutation.mutateAsync({ id, data: values });
      toast.success("Cập nhật thành công!");
      load();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setUpdating(false);
    }
  };

  return {
    data,
    loading,
    updating,
    form,
    onStatusUpdate,
  };
};
