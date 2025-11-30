/* eslint-disable no-undef */
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

export const useDrugFrom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drugData, setDrugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/drugs",
        label: "Quản lý thuốc",
        icon: null,
        active: true,
      },
    ],
    []
  );

  useEffect(() => {
    if (!id) {
      navigate("/admin/drugs");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);
      try {
        const response = await api.get(`/admin/drugs/${id}`);
        const data = response.data?.data || response.data;
        setDrugData(data);
        setLoadingProgress(1);
      } catch (e) {
        setError(e?.response?.data?.message || "Không tải được chi tiết thuốc");
        setLoadingProgress(1);
      } finally {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setTimeout(() => {
          setLoading(false);
          setLoadingProgress(0);
        }, 200);
      }
    };
    load();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [id, navigate]);

  const translateStatus = (status) => {
    const statusMap = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      recalled: "Thu hồi",
    };
    return statusMap[status] || status;
  };

  const translateNFTStatus = (status) => {
    const statusMap = {
      minted: "Đã đúc",
      transferred: "Đã chuyển",
      sold: "Đã bán",
      expired: "Hết hạn",
      recalled: "Thu hồi",
    };
    return statusMap[status] || status;
  };

  return {
    drugData,
    loading,
    error,
    loadingProgress,
    navigationItems,
    translateStatus,
    translateNFTStatus,
    id,
  };
};
