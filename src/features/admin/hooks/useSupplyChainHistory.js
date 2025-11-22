/* eslint-disable no-undef */
/* eslint-env browser */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";

const LIMIT = 10;
const ADMIN_BT_PREFIX = "/admin";

export const useSupplyChainHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const batchNumber = searchParams.get("batchNumber") || "";
  const drugName = searchParams.get("drugName") || "";
  const statusFilter = searchParams.get("status") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const [batchNumberInput, setBatchNumberInput] = useState("");
  const [drugNameInput, setDrugNameInput] = useState("");
  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [journeys, setJourneys] = useState({});
  const [journeyLoading, setJourneyLoading] = useState({});

  useEffect(() => {
    setBatchNumberInput(batchNumber);
    setDrugNameInput(drugName);
  }, [batchNumber, drugName]);

  const updateFilter = useCallback(
    (next) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(next).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback(() => {
    updateFilter({
      batchNumber: batchNumberInput,
      drugName: drugNameInput,
      page: 1,
    });
  }, [batchNumberInput, drugNameInput, updateFilter]);

  const handleClearSearch = useCallback(() => {
    setBatchNumberInput("");
    setDrugNameInput("");
    updateFilter({
      batchNumber: "",
      drugName: "",
      page: 1,
    });
  }, [updateFilter]);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit: LIMIT };
      if (batchNumber) {
        params.batchNumber = batchNumber;
      }
      if (drugName) {
        params.drugName = drugName;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const response = await api.get(`${ADMIN_BT_PREFIX}/batches`, {
        params,
      });

      // Handle different response structures
      const responseData = response.data;
      let data, batches, paginationData;

      if (responseData?.success) {
        // Standard format: { success: true, data: [...], pagination: {...} }
        data = responseData.data;
        batches = Array.isArray(data)
          ? data
          : data?.batches || data?.data || [];
        paginationData = responseData.pagination || data?.pagination;
      } else if (Array.isArray(responseData)) {
        // Direct array response
        batches = responseData;
        paginationData = null;
      } else if (responseData?.data) {
        // Nested data structure
        data = responseData.data;
        batches = Array.isArray(data) ? data : data?.batches || [];
        paginationData = responseData.pagination || data?.pagination;
      } else {
        // Fallback: try to extract from responseData directly
        batches = responseData?.batches || [];
        paginationData = responseData?.pagination;
      }

      setBatches(batches);
      setPagination({
        page: paginationData?.page ?? page,
        limit: paginationData?.limit ?? LIMIT,
        total: paginationData?.total ?? batches.length,
        totalPages:
          paginationData?.totalPages ??
          Math.max(
            1,
            Math.ceil((paginationData?.total ?? batches.length) / LIMIT)
          ),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Không thể tải dữ liệu batch:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi khi tải dữ liệu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [batchNumber, drugName, statusFilter, fromDate, toDate, page]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleToggleBatch = useCallback(
    async (batch) => {
      const isExpanded = expandedBatch === batch.batchNumber;
      const nextExpanded = isExpanded ? null : batch.batchNumber;
      setExpandedBatch(nextExpanded);

      if (isExpanded || journeys[batch.batchNumber]) {
        return;
      }

      setJourneyLoading((prev) => ({ ...prev, [batch.batchNumber]: true }));
      try {
        const response = await api.get(
          `${ADMIN_BT_PREFIX}/batches/${encodeURIComponent(
            batch.batchNumber
          )}/journey`
        );
        const data = response.data?.data || response.data;
        if (!data?.success) {
          throw new Error(
            data?.message || "Không thể lấy thông tin hành trình"
          );
        }
        setJourneys((prev) => ({ ...prev, [batch.batchNumber]: data.data }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Không thể tải hành trình lô hàng:", err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi tải hành trình.";
        setError(message);
      } finally {
        setJourneyLoading((prev) => ({ ...prev, [batch.batchNumber]: false }));
      }
    },
    [expandedBatch, journeys]
  );

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      },
    }),
    []
  );

  return {
    page,
    batchNumberInput,
    drugNameInput,
    statusFilter,
    fromDate,
    toDate,
    batches,
    pagination,
    loading,
    error,
    expandedBatch,
    journeys,
    journeyLoading,
    fadeUp,
    setBatchNumberInput,
    setDrugNameInput,
    handleSearch,
    handleClearSearch,
    handleToggleBatch,
    updateFilter,
  };
};
