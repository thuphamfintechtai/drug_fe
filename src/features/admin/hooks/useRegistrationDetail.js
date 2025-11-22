import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAdminApproveRegistration,
  useAdminRejectRegistration,
  useAdminRetryRegistrationBlockchain,
} from "../apis/mutations/adminMutation";
import api from "../../utils/api";

export const useRegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  const approveMutation = useAdminApproveRegistration();
  const rejectMutation = useAdminRejectRegistration();
  const retryMutation = useAdminRetryRegistrationBlockchain();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/registration/requests/${id}`);
        const data = response.data?.data || response.data;
        setItem(data?.data || data);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError("");
    try {
      await approveMutation.mutateAsync(id);
      navigate("/admin/registrations");
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể duyệt đơn");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await rejectMutation.mutateAsync({
        id,
        rejectionReason: rejectReason,
      });
      navigate("/admin/registrations");
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể từ chối đơn");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    setError("");
    try {
      await retryMutation.mutateAsync(id);
      const response = await api.get(`/registration/requests/${id}`);
      const data = response.data?.data || response.data;
      setItem(data?.data || data);
    } catch (e) {
      setError(e?.response?.data?.message || "Retry blockchain thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    item,
    loading,
    error,
    rejectReason,
    setRejectReason,
    actionLoading,
    handleApprove,
    handleReject,
    handleRetry,
  };
};
