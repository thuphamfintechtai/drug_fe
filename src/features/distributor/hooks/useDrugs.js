/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { distributorQueries } from "../apis/distributor";
import { useQueryClient } from "@tanstack/react-query";

const DRUGS_CACHE_KEY = ["distributor", "drugs", "list"];

export const useDrugs = () => {
  const queryClient = useQueryClient();
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const [searchAtc, setSearchAtc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const { data: drugsResponse, isLoading: queryLoading } =
    distributorQueries.getDrugs();

  useEffect(() => {
    const cached = queryClient.getQueryData(DRUGS_CACHE_KEY);
    if (cached?.drugs?.length) {
      setDrugs(cached.drugs);
      setAllDrugs(cached.drugs);
      setLoadingProgress(0);
    }
    if (drugsResponse?.data) {
      const list = Array.isArray(drugsResponse.data.drugs)
        ? drugsResponse.data.drugs
        : Array.isArray(drugsResponse.data.data?.drugs)
        ? drugsResponse.data.data.drugs
        : [];
      setDrugs(list);
      setAllDrugs(list);
      queryClient.setQueryData(DRUGS_CACHE_KEY, { drugs: list });
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [drugsResponse, queryClient]);

  const loading = queryLoading || loadingProgress > 0;

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
