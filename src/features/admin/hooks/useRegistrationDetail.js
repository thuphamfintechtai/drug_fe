import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminQueries } from "../apis/queries/adminQueries";
import { adminMutations } from "../apis/mutations/adminMutation";

export const useRegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await adminQueries.getRegistrationById(id);
        setItem(data?.data);
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
      await adminMutations.approveRegistration(id);
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
      await adminMutations.rejectRegistration({
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
      await adminMutations.retryRegistrationBlockchain(id);
      const { data } = await adminQueries.getRegistrationById(id);
      setItem(data?.data);
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
