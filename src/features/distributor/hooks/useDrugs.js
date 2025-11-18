/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { distributorQueries } from "../apis/distributor";
import { useQueryClient } from "@tanstack/react-query";

export const useDrugs = () => {
  const queryClient = useQueryClient();
  const DRUGS_CACHE_KEY = ["distributor", "drugs", "list"];
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAtc, setSearchAtc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const { mutateAsync: fetchDrugs } = distributorQueries.getDrugs();
  useEffect(() => {
    const cached = queryClient.getQueryData(DRUGS_CACHE_KEY);
    if (cached?.drugs?.length) {
      setDrugs(cached.drugs);
      setAllDrugs(cached.drugs);
      setLoading(false);
      setLoadingProgress(0);
    }
    loadDrugs(!cached?.drugs?.length);
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

  const loadDrugs = async (showLoader = allDrugs.length === 0) => {
    const shouldShowLoader = showLoader;
    try {
      if (shouldShowLoader) {
        setLoading(true);
        startProgress();
      }
      const response = await fetchDrugs();
      if (response.data.success && response.data.data) {
        const list = Array.isArray(response.data.data.drugs)
          ? response.data.data.drugs
          : [];
        setDrugs(list);
        setAllDrugs(list);
        queryClient.setQueryData(DRUGS_CACHE_KEY, { drugs: list });
      } else {
        setDrugs([]);
        setAllDrugs([]);
      }
      if (shouldShowLoader) {
        await finishProgress();
      }
    } catch (error) {
      if (shouldShowLoader && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách thuốc:", error);
      setDrugs([]);
      setAllDrugs([]);
      if (shouldShowLoader) {
        setLoadingProgress(0);
      }
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
        setTimeout(() => setLoadingProgress(0), 500);
      }
    }
  };

  const handleSearch = (searchValue = null) => {
    const term = (searchValue !== null ? searchValue : searchAtc)
      .trim()
      .toLowerCase();
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

  const handleClearSearch = () => {
    setSearchAtc("");
    setDrugs(allDrugs);
  };

  return {
    drugs,
    allDrugs,
    loading,
    searchAtc,
    setSearchAtc,
    loadingProgress,
    handleSearch,
    handleClearSearch,
  };
};
