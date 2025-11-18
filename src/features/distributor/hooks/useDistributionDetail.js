import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";
import { Form } from "antd";
import { toast } from "sonner";

export const useDistributionDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutateAsync: fetchDistributionDetail } =
    distributorQueries.getDistributionDetail();
  const { mutateAsync: confirmDistributionMutation } =
    distributorQueries.confirmDistribution();
  const { mutateAsync: updateDistributionStatusMutation } =
    distributorQueries.updateDistributionStatus();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchDistributionDetail(id);
      const detail = res?.data?.data ? res.data.data : res?.data || null;
      setData(detail);
      if (detail) {
        form.setFieldsValue({
          status: detail.status || "pending",
          notes: detail.notes || "",
        });
      }
    } catch (error) {
      console.error("Fetch detail error:", error);
      toast.error("Không xem được chi tiết lô hàng");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onConfirm = async () => {
    try {
      await confirmDistributionMutation(id);
      toast.success("Đã xác nhận nhận hàng!");
      load();
    } catch {
      toast.error("Xác nhận thất bại");
    }
  };

  const onStatusUpdate = async (values) => {
    if (!id) {
      toast.error("Không tìm thấy lô hàng");
      return;
    }
    setUpdating(true);
    try {
      await updateDistributionStatusMutation({ id, data: values });
      toast.success("Cập nhật trạng thái thành công!");
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
    onConfirm,
    onStatusUpdate,
  };
};
