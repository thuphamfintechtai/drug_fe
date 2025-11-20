/* eslint-disable no-undef */
import { useEffect, useState, useRef } from "react";
import api from "../../utils/api";

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [qualityStats, setQualityStats] = useState(null);
  const [chartData, setChartData] = useState({
    oneWeek: [],
    todayYesterday: [],
    monthly: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadAllData();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 0.9) {
            return Math.min(prev + 0.02, 0.9);
          }
          return prev;
        });
      }, 50);

      // Make parallel API calls
      const [
        statsResponse,
        dashboardStatsResponse,
        qualityStatsResponse,
        oneWeekResponse,
        todayYesterdayResponse,
        monthlyResponse,
      ] = await Promise.allSettled([
        api.get("/pharmacy/statistics"),
        api.get("/statistics/pharmacy/dashboard"),
        api.get("/statistics/pharmacy/quality"),
        api.get("/pharmacy/chart/one-week"),
        api.get("/pharmacy/chart/today-yesterday"),
        api.get("/statistics/trends/monthly", { params: { months: 6 } }),
      ]);

      // Extract data from responses
      if (
        statsResponse.status === "fulfilled" &&
        statsResponse.value.data?.success
      ) {
        setStats(statsResponse.value.data.data);
      }

      if (
        dashboardStatsResponse.status === "fulfilled" &&
        dashboardStatsResponse.value.data?.success
      ) {
        setDashboardStats(dashboardStatsResponse.value.data.data);
      }

      if (
        qualityStatsResponse.status === "fulfilled" &&
        qualityStatsResponse.value.data?.success
      ) {
        setQualityStats(qualityStatsResponse.value.data.data);
      }

      // Handle oneWeek chart data - ensure it's always an array
      if (
        oneWeekResponse.status === "fulfilled" &&
        oneWeekResponse.value.data?.success
      ) {
        const data = oneWeekResponse.value.data.data;
        let oneWeekData = [];
        if (Array.isArray(data)) {
          oneWeekData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          oneWeekData = data.data;
        } else if (data?.chart && Array.isArray(data.chart)) {
          oneWeekData = data.chart;
        }
        setChartData((prev) => ({
          ...prev,
          oneWeek: oneWeekData,
        }));
      } else {
        setChartData((prev) => ({ ...prev, oneWeek: [] }));
      }

      // Handle todayYesterday chart data - ensure it's always an array
      if (
        todayYesterdayResponse.status === "fulfilled" &&
        todayYesterdayResponse.value.data?.success
      ) {
        const data = todayYesterdayResponse.value.data.data;
        let todayYesterdayData = [];
        if (Array.isArray(data)) {
          todayYesterdayData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          todayYesterdayData = data.data;
        } else if (data?.chart && Array.isArray(data.chart)) {
          todayYesterdayData = data.chart;
        }
        setChartData((prev) => ({
          ...prev,
          todayYesterday: todayYesterdayData,
        }));
      } else {
        setChartData((prev) => ({ ...prev, todayYesterday: [] }));
      }

      // Handle monthly chart data - ensure it's always an array
      if (
        monthlyResponse.status === "fulfilled" &&
        monthlyResponse.value.data?.success
      ) {
        const data = monthlyResponse.value.data.data;
        let formattedData = [];
        if (Array.isArray(data)) {
          formattedData = data;
        } else if (data?.trends && Array.isArray(data.trends)) {
          formattedData = data.trends.map((item) => ({
            month: item.month || item.date || "",
            receipts: item.receipts || item.count || 0,
          }));
        } else if (data?.data && Array.isArray(data.data)) {
          formattedData = data.data;
        }
        setChartData((prev) => ({ ...prev, monthly: formattedData }));
      } else {
        setChartData((prev) => ({ ...prev, monthly: [] }));
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  const displayStats = dashboardStats || stats;

  const invoiceStatusData =
    displayStats?.invoicesReceived?.byStatus || displayStats?.invoices?.byStatus
      ? Object.entries(
          displayStats.invoicesReceived?.byStatus ||
            displayStats.invoices?.byStatus
        )
          .map(([name, value]) => ({
            name:
              name === "draft"
                ? "Nháp"
                : name === "issued"
                ? "Đã phát hành"
                : name === "sent"
                ? "Đã nhận"
                : name === "paid"
                ? "Đã thanh toán"
                : name === "cancelled"
                ? "Đã hủy"
                : name,
            value: value || 0,
          }))
          .filter((item) => item.value > 0)
      : [];

  const nftStatusData = displayStats?.nfts?.byStatus
    ? Object.entries(displayStats.nfts.byStatus)
        .map(([name, value]) => ({
          name:
            name === "minted"
              ? "Đã mint"
              : name === "transferred"
              ? "Đã chuyển"
              : name === "sold"
              ? "Đã bán"
              : name === "expired"
              ? "Hết hạn"
              : name === "recalled"
              ? "Thu hồi"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  const receiptsStatusData = displayStats?.receipts?.byStatus
    ? Object.entries(displayStats.receipts.byStatus)
        .map(([name, value]) => ({
          name:
            name === "pending"
              ? "Chờ xử lý"
              : name === "received"
              ? "Đã nhận"
              : name === "verified"
              ? "Đã xác minh"
              : name === "completed"
              ? "Hoàn tất"
              : name === "rejected"
              ? "Từ chối"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  return {
    stats,
    dashboardStats,
    qualityStats,
    chartData,
    loading,
    loadingProgress,
    loadAllData,
    invoiceStatusData,
    nftStatusData,
    receiptsStatusData,
  };
};
