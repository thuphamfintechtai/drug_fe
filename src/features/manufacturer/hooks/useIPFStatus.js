/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";

export const useIPFStatus = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadStatus();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);

      const res = await manufacturerAPIs.getManufactureIPFSStatus();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      const raw = res?.data?.data || res?.data?.items || res?.data || {};
      const list = Array.isArray(raw)
        ? raw
        : raw.ManufactureIPFSStatus || raw.records || [];

      // Chuẩn hóa dữ liệu để hiển thị nhất quán
      const normalized = (Array.isArray(list) ? list : []).map((it) => {
        const url = it.IPFSUrl || it.ipfsUrl || it.url || "";
        const cidMatch = url.match(/\/ipfs\/([^/?#]+)/i);
        const cid = cidMatch ? cidMatch[1] : "";
        const ts = it.timespan || it.timestamp || it.time || it.createdAt;
        const timeValue =
          typeof ts === "string" && /^\d+$/.test(ts)
            ? new Date(parseInt(ts, 10))
            : new Date(ts);
        return {
          id: it._id || it.id,
          createdAt: timeValue,
          ipfsHash: cid || it.cid || it.hash,
          ipfsUrl: url,
          quantity: it.quantity || it.amount || it.total,
          status: it.status || it.state,
          note: it.message || it.note || it.error,
        };
      });

      setItems(normalized);

      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi tải lịch sử IPFS:", e);
      setError(
        e.response?.data?.message || e.message || "Không thể tải dữ liệu"
      );
      toast.error("Không thể tải lịch sử IPFS", { position: "top-right" });
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
      return "—";
    }
    return d.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("success") || s === "done") {
      return {
        text: "Thành công",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (s.includes("pending") || s.includes("processing")) {
      return {
        text: "Đang xử lý",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (s.includes("fail") || s.includes("error")) {
      return { text: "Lỗi", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    return {
      text: status || "Không rõ",
      cls: "bg-slate-50 text-slate-700 border-slate-200",
    };
  };
};
