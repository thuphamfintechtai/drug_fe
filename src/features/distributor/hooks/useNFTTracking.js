/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { distributorQueries } from "../apis/distributor";

export const useNFTTracking = () => {
  const [tokenId, setTokenId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState("");
  // Loading cho PAGE (khởi động trang)
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);
  // Trạng thái tra cứu (không hiển thị TruckLoader)
  const [isSearching, setIsSearching] = useState(false);
  const { mutateAsync: trackDrugByNFT } = distributorQueries.trackDrugByNFT();

  useEffect(() => {
    // Mô phỏng loading khi vào trang để xe chạy
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

  const handleTrack = async () => {
    if (!tokenId.trim()) {
      setError("Vui lòng nhập NFT ID");
      return;
    }

    setIsSearching(true);
    setError("");
    setTrackingData(null);

    try {
      const response = await trackDrugByNFT(tokenId);
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tra cứu NFT");
    } finally {
      setIsSearching(false);
    }
  };

  return {
    tokenId,
    setTokenId,
    trackingData,
    setTrackingData,
    error,
    setError,
    pageLoading,
    pageProgress,
    isSearching,
    setIsSearching,
  };
};
