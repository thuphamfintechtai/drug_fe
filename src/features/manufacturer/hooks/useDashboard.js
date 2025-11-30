import { useMemo } from "react";
import {
  useManufacturerStatistics,
  useManufacturerDashboardStats,
  useManufacturerChartOneWeek,
  useManufacturerChartTodayYesterday,
  useManufacturerMonthlyTrends,
} from "../apis/manufacturerAPIs";

export const useDashboard = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useManufacturerStatistics();

  const {
    data: dashboardStatsData,
    isLoading: dashboardStatsLoading,
    error: dashboardStatsError,
    refetch: refetchDashboardStats,
  } = useManufacturerDashboardStats();

  const {
    data: oneWeekData,
    isLoading: oneWeekLoading,
    error: oneWeekError,
    refetch: refetchOneWeek,
  } = useManufacturerChartOneWeek();

  const {
    data: todayYesterdayData,
    isLoading: todayYesterdayLoading,
    error: todayYesterdayError,
    refetch: refetchTodayYesterday,
  } = useManufacturerChartTodayYesterday();

  const {
    data: monthlyData,
    isLoading: monthlyLoading,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useManufacturerMonthlyTrends(6);

  const loading =
    statsLoading ||
    dashboardStatsLoading ||
    oneWeekLoading ||
    todayYesterdayLoading ||
    monthlyLoading;

  const error =
    statsError ||
    dashboardStatsError ||
    oneWeekError ||
    todayYesterdayError ||
    monthlyError;

  const stats = useMemo(() => {
    if (statsData?.success) {
      return statsData.data;
    }
    return null;
  }, [statsData]);

  const dashboardStats = useMemo(() => {
    if (dashboardStatsData?.success) {
      return dashboardStatsData.data;
    }
    return null;
  }, [dashboardStatsData]);

  const chartData = useMemo(() => {
    const result = {
      oneWeek: null,
      todayYesterday: null,
      monthly: null,
    };

    if (oneWeekData?.success && oneWeekData.data) {
      const data = oneWeekData.data;
      // Handle dailyStats as array or object
      let dailyStatsArray = [];
      if (Array.isArray(data.dailyStats)) {
        dailyStatsArray = data.dailyStats;
      } else if (data.dailyStats && typeof data.dailyStats === 'object') {
        dailyStatsArray = Object.entries(data.dailyStats).map(([date, stats]) => ({
          date,
          count: stats?.count || 0,
          quantity: stats?.quantity || 0,
        }));
      }
      
      // Sort by date first, then map to formatted date
      dailyStatsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      result.oneWeek = dailyStatsArray.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        count: item.count || 0,
        quantity: item.quantity || 0,
      }));
    }

    if (todayYesterdayData?.success && todayYesterdayData.data) {
      const data = todayYesterdayData.data;
      result.todayYesterday = [
        { name: "Hôm qua", count: data.yesterdayCount || 0 },
        { name: "Hôm nay", count: data.todayCount || 0 },
      ];
    }

    if (monthlyData?.success && monthlyData.data) {
      const data = monthlyData.data;
      result.monthly = (data.trends || []).map((item) => ({
        month: item.month,
        productions: item.productions || 0,
        transfers: item.transfers || 0,
      }));
    }

    return result;
  }, [oneWeekData, todayYesterdayData, monthlyData]);

  const loadAllData = async () => {
    await Promise.all([
      refetchStats(),
      refetchDashboardStats(),
      refetchOneWeek(),
      refetchTodayYesterday(),
      refetchMonthly(),
    ]);
  };

  const nftStatusSource =
    dashboardStats?.nfts?.byStatus ||
    dashboardStats?.byStatus?.nfts ||
    stats?.nfts?.byStatus ||
    stats?.byStatus?.nfts;

  const nftStatusData = nftStatusSource
    ? Object.entries(nftStatusSource)
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

  const transferStatusSource =
    dashboardStats?.transfers?.byStatus ||
    dashboardStats?.byStatus?.transfers ||
    stats?.transfers?.byStatus ||
    stats?.byStatus?.transfers;

  const transferStatusData = transferStatusSource
    ? Object.entries(transferStatusSource)
        .map(([name, value]) => ({
          name:
            name === "pending"
              ? "Chờ xử lý"
              : name === "sent"
              ? "Đã gửi"
              : name === "paid"
              ? "Đã thanh toán"
              : name === "cancelled"
              ? "Đã hủy"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  const displayStats = stats || dashboardStats;

  return {
    stats,
    dashboardStats,
    chartData,
    loading,
    error,
    loadAllData,
    nftStatusData,
    transferStatusData,
    displayStats,
  };
};
