import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useDistributorDistributionDetail,
  useConfirmDistribution,
  useUpdateDistributionStatus,
} from "../apis/distributor";
import { Form } from "antd";
import { toast } from "sonner";
import api from "../../utils/api";

export const useDistributionDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const confirmDistributionMutation = useConfirmDistribution();
  const updateDistributionStatusMutation = useUpdateDistributionStatus();

  const load = async () => {
    setLoading(true);
    try {
      // Thử dùng API invoice detail trước (vì đây là invoice từ NSX)
      let response;
      try {
        response = await api.get(`/distributor/invoices/${id}/detail`);
      } catch (invoiceError) {
        // Nếu không được, thử API distribution detail
        console.log("Invoice detail API failed, trying distribution detail API");
        response = await api.get(`/distributor/distributions/${id}`);
      }
      
      const res = response.data?.data || response.data;
      const detail = res?.data?.data ? res.data.data : res?.data || res || null;
      
      console.log("Distribution Detail Response:", response.data);
      console.log("Distribution Detail Data:", detail);
      
      if (!detail) {
        console.error("No detail data found in response");
        throw new Error("Không tìm thấy dữ liệu");
      }
      
      setData(detail);
      if (detail) {
        const currentStatus = detail.status || detail._status || "pending";
        form.setFieldsValue({
          status: currentStatus,
          notes: detail.notes || "",
        });
      }
    } catch (error) {
      console.error("Fetch detail error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không xem được chi tiết lô hàng";
      toast.error(errorMessage);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  const onConfirm = async () => {
    if (!id) {
      toast.error("Không tìm thấy ID đơn hàng!");
      return;
    }
    try {
      // Gửi payload với invoiceId
      await confirmDistributionMutation.mutateAsync({ invoiceId: id });
      toast.success("Đã xác nhận nhận hàng!");
      load();
    } catch (error) {
      console.error("Confirm error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Xác nhận thất bại";
      toast.error(errorMessage);
    }
  };

  const onStatusUpdate = async (values) => {
    if (!id) {
      toast.error("Không tìm thấy lô hàng");
      return;
    }
    setUpdating(true);
    try {
      await updateDistributionStatusMutation.mutateAsync({ id, data: values });
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
