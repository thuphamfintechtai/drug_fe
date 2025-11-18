/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import { pharmacyQueries } from "../apis/pharmacyQueries";

export const useNFTTracking = () => {
  const [nftId, setNftId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);

  useEffect(() => {
    setPageLoading(true);
    setPageProgress(0);
    if (pageIntervalRef.current) {
      clearInterval(pageIntervalRef.current);
      pageIntervalRef.current = null;
    }
    pageIntervalRef.current = setInterval(() => {
      setPageProgress((prev) =>
        prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
      );
    }, 50);
    const complete = async () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
      let current = 0;
      setPageProgress((p) => {
        current = p;
        return p;
      });
      if (current < 0.9) {
        await new Promise((resolve) => {
          const su = setInterval(() => {
            setPageProgress((prev) => {
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
            setPageProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setPageProgress(1);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
      setPageLoading(false);
      setTimeout(() => setPageProgress(0), 500);
    };
    complete();
    return () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!nftId.trim()) {
      setError("Vui lòng nhập NFT ID");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    try {
      const response = await pharmacyQueries.trackDrugByNFTId(nftId.trim());
      if (response.data && response.data.success) {
        setData(response.data.data || response.data);
      } else {
        setError(response.data?.message || "Không tìm thấy NFT này");
      }
    } catch (e2) {
      setError(e2?.response?.data?.message || "Không thể tra cứu NFT");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) {
      return "N/A";
    }
    const date = new Date(d);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
  };

  const short = (s) => {
    if (!s || typeof s !== "string") {
      return "N/A";
    }
    if (s.length <= 12) {
      return s;
    }
    return `${s.slice(0, 8)}...${s.slice(-4)}`;
  };

  return {
    nftId,
    setNftId,
    data,
    loading,
    error,
    pageLoading,
    pageProgress,
    handleSearch,
    formatDate,
    short,
    setError,
    setData,
  };
};
