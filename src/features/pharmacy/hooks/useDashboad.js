/* eslint-disable no-undef */
import { useEffect, useState, useRef } from "react";
import { pharmacyQueries } from "../apis/pharmacyQueries";

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [qualityStats, setQualityStats] = useState(null);
  const [chartData, setChartData] = useState({
    oneWeek: null,
    todayYesterday: null,
    monthly: null,
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

      const { data: stats } = pharmacyQueries.getStatistics();
      const { data: dashboardStats } = pharmacyQueries.getDashboardStats();
      const { data: qualityStats } = pharmacyQueries.getQualityStats();
      const { data: oneWeek } = pharmacyQueries.getChartOneWeek();
      const { data: todayYesterday } = pharmacyQueries.getChartTodayYesterday();
      const { data: monthly } = pharmacyQueries.getMonthlyTrends(6);

      setStats(stats);
      setDashboardStats(dashboardStats);
      setQualityStats(qualityStats);
      setChartData((prev) => ({ ...prev, oneWeek: oneWeek }));
      setChartData((prev) => ({ ...prev, todayYesterday: todayYesterday }));
      setChartData((prev) => ({ ...prev, monthly: monthly }));

      if (monthlyRes.status === "fulfilled" && monthlyRes.value.data?.success) {
        const data = monthlyRes.value.data.data;
        const formattedData = (data.trends || []).map((item) => ({
          month: item.month,
          receipts: item.receipts || 0,
        }));
        setChartData((prev) => ({ ...prev, monthly: formattedData }));
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
  };
};
