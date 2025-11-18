/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { pharmacyQueries } from "../apis/pharmacyQueries";

export const useDrug = () => {
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAtc, setSearchAtc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadDrugs();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const startProgress = () => {
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
  };

  const finishProgress = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    let current = 0;
    setLoadingProgress((prev) => {
      current = prev;
      return prev;
    });
    if (current < 0.9) {
      await new Promise((resolve) => {
        const speedUp = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev < 1) {
              const np = Math.min(prev + 0.15, 1);
              if (np >= 1) {
                clearInterval(speedUp);
                resolve();
              }
              return np;
            }
            clearInterval(speedUp);
            resolve();
            return 1;
          });
        }, 30);
        setTimeout(() => {
          clearInterval(speedUp);
          setLoadingProgress(1);
          resolve();
        }, 500);
      });
    } else {
      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 100));
  };

  const loadDrugs = async () => {
    try {
      setLoading(true);
      startProgress();
      const response = await pharmacyQueries.getDrugs();
      if (response.data.success && response.data.data) {
        const list = Array.isArray(response.data.data.drugs)
          ? response.data.data.drugs
          : [];
        setDrugs(list);
        setAllDrugs(list);
      } else {
        setDrugs([]);
        setAllDrugs([]);
      }
      await finishProgress();
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách thuốc:", error);
      setDrugs([]);
      setAllDrugs([]);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const handleSearch = () => {
    const term = searchAtc.trim().toLowerCase();
    if (!term) {
      setDrugs(allDrugs);
      return;
    }
    // Lọc client theo Tên thương mại | Tên hoạt chất | Mã ATC
    const filtered = (allDrugs || []).filter((d) => {
      const trade = (d.tradeName || "").toLowerCase();
      const generic = (d.genericName || "").toLowerCase();
      const atc = (d.atcCode || "").toLowerCase();
      return (
        trade.includes(term) || generic.includes(term) || atc.includes(term)
      );
    });
    setDrugs(filtered);
  };

  const safeDrugs = Array.isArray(drugs) ? drugs : [];

  return {
    drugs,
    allDrugs,
    loading,
    searchAtc,
    loadingProgress,
    handleSearch,
    handleClearSearch,
    safeDrugs,
  };
};
