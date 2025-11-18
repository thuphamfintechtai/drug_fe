import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";
import { Form } from "antd";
import { toast } from "sonner";

export const useInvoiceDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutateAsync: fetchInvoiceById } =
    distributorQueries.getInvoiceDetail();
  const { mutateAsync: updateInvoiceStatusMutation } =
    distributorQueries.updateInvoiceStatus();

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchInvoiceById(id);
      const detail = res?.data?.data ? res.data.data : res?.data || null;
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
      await updateInvoiceStatusMutation({ id, data: values });
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
