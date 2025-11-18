import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";
import { Form } from "antd";
import { toast } from "sonner";

export const useDeliveryDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutateAsync: fetchProofOfPharmacy } =
    distributorQueries.getProofOfPharmacyById();
  const { mutateAsync: updatePharmacyDeliveryStatusMutation } =
    distributorQueries.updatePharmacyDeliveryStatus();

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchProofOfPharmacy(id);
      const detail = res?.data?.data ? res.data.data : res?.data || null;
      if (detail) {
        setData(detail);
        form.setFieldsValue({
          status: detail.status || "pending",
          notes: detail.notes || "",
        });
      } else {
        toast.error("Không tìm thấy đơn giao hàng");
        navigate(-1);
      }
    } catch (error) {
      console.error("Load delivery error:", error);
      toast.error("Không tải được chi tiết đơn giao hàng");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const onStatusUpdate = async (values) => {
    if (!id) {
      toast.error("Không tìm thấy đơn giao hàng");
      return;
    }
    setUpdating(true);
    try {
      await updatePharmacyDeliveryStatusMutation({ id, data: values });
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
