/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isValidObjectId } from "../../auth/utils/isValidObjectId";
import { proofOfDistributionQueries } from "../apis/queries/proofOfDistributionQueries";

export const useDistributionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [distributorIdInput, setDistributorIdInput] = useState("");
  const [pharmacyIdInput, setPharmacyIdInput] = useState("");
  const [drugIdInput, setDrugIdInput] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const page = parseInt(searchParams.get("page") || "1", 10);
  const distributorId = searchParams.get("distributorId") || "";
  const pharmacyId = searchParams.get("pharmacyId") || "";
  const drugId = searchParams.get("drugId") || "";
  const status = searchParams.get("status") || "";

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, String(v));
      }
    });
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const invalidParams = {};

    if (distributorId && isValidObjectId(distributorId)) {
      setDistributorIdInput(distributorId);
    } else if (distributorId) {
      invalidParams.distributorId = "";
      setDistributorIdInput("");
    } else {
      setDistributorIdInput("");
    }

    if (pharmacyId && isValidObjectId(pharmacyId)) {
      setPharmacyIdInput(pharmacyId);
    } else if (pharmacyId) {
      invalidParams.pharmacyId = "";
      setPharmacyIdInput("");
    } else {
      setPharmacyIdInput("");
    }

    if (drugId && isValidObjectId(drugId)) {
      setDrugIdInput(drugId);
    } else if (drugId) {
      invalidParams.drugId = "";
      setDrugIdInput("");
    } else {
      setDrugIdInput("");
    }

    if (Object.keys(invalidParams).length > 0) {
      updateFilter(invalidParams);
    }
  }, [distributorId, pharmacyId, drugId]);

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/distribution",
        label: "Lịch sử phân phối",
        icon: null,
        active: true,
      },
    ],
    []
  );

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
      const params = { page, limit: 20 };
      if (distributorId && isValidObjectId(distributorId)) {
        params.distributorId = distributorId;
      }
      if (pharmacyId && isValidObjectId(pharmacyId)) {
        params.pharmacyId = pharmacyId;
      }
      if (drugId && isValidObjectId(drugId)) {
        params.drugId = drugId;
      }
      if (status) {
        params.status = status;
      }

      const response = await proofOfDistributionQueries.listDistributions(
        params
      );

      if (response.success) {
        setItems(response.data.distributions || []);
        setPagination(response.data.pagination);
      }
    } catch (e) {
      const errorMessage =
        e?.response?.data?.message || e?.message || "Không thể tải dữ liệu";
      if (
        errorMessage.includes("ObjectId") ||
        errorMessage.includes("Cast to ObjectId")
      ) {
        setError(
          "Mã ID không hợp lệ. Vui lòng kiểm tra lại định dạng ObjectId (24 ký tự hex)."
        );
        const invalidParams = {};
        if (distributorId && !isValidObjectId(distributorId)) {
          invalidParams.distributorId = "";
          setDistributorIdInput("");
        }
        if (pharmacyId && !isValidObjectId(pharmacyId)) {
          invalidParams.pharmacyId = "";
          setPharmacyIdInput("");
        }
        if (drugId && !isValidObjectId(drugId)) {
          invalidParams.drugId = "";
          setDrugIdInput("");
        }
        if (Object.keys(invalidParams).length > 0) {
          updateFilter(invalidParams);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      let current = 0;
      setLoadingProgress((p) => {
        current = p;
        return p;
      });
      if (current < 0.9) {
        await new Promise((resolve) => {
          const su = setInterval(() => {
            setLoadingProgress((prev) => {
              if (prev < 1) {
                const np = Math.min(prev + 0.15, 1);
                if (np >= 1) {
                  clearInterval(su);
                  resolve();
                }
                return np;
              }
              clearInterval(su);
              resolve();
              return 1;
            });
          }, 30);
          setTimeout(() => {
            clearInterval(su);
            setLoadingProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, distributorId, pharmacyId, drugId, status]);

  const handleSearch = () => {
    const errors = {};

    if (distributorIdInput && !isValidObjectId(distributorIdInput)) {
      errors.distributorId =
        "Mã NPP không hợp lệ. Vui lòng nhập ObjectId 24 ký tự (ví dụ: 507f1f77bcf86cd799439011)";
    }
    if (pharmacyIdInput && !isValidObjectId(pharmacyIdInput)) {
      errors.pharmacyId =
        "Mã nhà thuốc không hợp lệ. Vui lòng nhập ObjectId 24 ký tự (ví dụ: 507f1f77bcf86cd799439011)";
    }
    if (drugIdInput && !isValidObjectId(drugIdInput)) {
      errors.drugId =
        "Mã thuốc không hợp lệ. Vui lòng nhập ObjectId 24 ký tự (ví dụ: 507f1f77bcf86cd799439011)";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      updateFilter({
        distributorId: distributorIdInput.trim(),
        pharmacyId: pharmacyIdInput.trim(),
        drugId: drugIdInput.trim(),
        page: 1,
      });
    }
  };

  const handleClearSearch = () => {
    setDistributorIdInput("");
    setPharmacyIdInput("");
    setDrugIdInput("");
    setValidationErrors({});
    updateFilter({
      distributorId: "",
      pharmacyId: "",
      drugId: "",
      page: 1,
    });
  };

  return {
    items,
    loading,
    error,
    pagination,
    loadingProgress,
    navigationItems,
    load,
    handleSearch,
    handleClearSearch,
    updateFilter,
    searchParams,
    setSearchParams,
    distributorIdInput,
    pharmacyIdInput,
    drugIdInput,
    validationErrors,
  };
};
