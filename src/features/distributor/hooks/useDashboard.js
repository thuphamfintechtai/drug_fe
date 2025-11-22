import { useMemo, useState } from "react";
import { distributorQueries } from "../apis/distributor";

export const useDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = distributorQueries.getStatistics();

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    refetch: refetchDashboard,
  } = distributorQueries.getDashboardStats();

  const {
    data: chartOneWeekResponse,
    isLoading: chartOneWeekLoading,
    isFetching: chartOneWeekFetching,
    refetch: refetchChartOneWeek,
  } = distributorQueries.getChartOneWeek();

  const {
    data: chartTodayYesterdayResponse,
    isLoading: chartTodayYesterdayLoading,
    isFetching: chartTodayYesterdayFetching,
    refetch: refetchChartTodayYesterday,
  } = distributorQueries.getChartTodayYesterday();

  const {
    data: monthlyTrendsResponse,
    isLoading: monthlyTrendsLoading,
    isFetching: monthlyTrendsFetching,
    refetch: refetchMonthlyTrends,
  } = distributorQueries.getMonthlyTrends(6);

  const stats = statsResponse?.data?.data || statsResponse?.data;
  const dashboardStats = dashboardResponse?.data?.overview || dashboardResponse?.data?.data;

  // Debug logs
  console.log("Dashboard Response:", dashboardResponse);
  console.log("Processed Dashboard Stats:", dashboardStats);

  const chartOneWeekData = useMemo(() => {
    const data = chartOneWeekResponse?.data?.data || chartOneWeekResponse?.data;
    if (!data?.dailyStats) {
      return null;
    }
    const formatted = Object.entries(data.dailyStats).map(([date, stat]) => {
      const dateObj = new Date(date);
      return {
        sortKey: dateObj.getTime(),
        date: dateObj.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        invoicesReceived: stat.count || 0,
        quantity: stat.quantity || 0,
      };
    });
    return formatted
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ sortKey, ...rest }) => rest);
  }, [chartOneWeekResponse]);

  const chartTodayYesterdayData = useMemo(() => {
    const data = chartTodayYesterdayResponse?.data?.data || chartTodayYesterdayResponse?.data;
    if (!data) {
      return null;
    }
    return [
      { name: "Hôm qua", count: data.yesterdayCount || 0 },
      { name: "Hôm nay", count: data.todayCount || 0 },
    ];
  }, [chartTodayYesterdayResponse]);

  const chartMonthlyData = useMemo(() => {
    const data = monthlyTrendsResponse?.data;
    console.log("📈 Monthly Trends Response:", monthlyTrendsResponse);
    console.log("📈 Monthly Trends Data:", data);
    if (!data?.trends) {
      return null;
    }
    const processed = (data.trends || []).map((item) => ({
      month: item.month,
      invoicesReceived: item.invoicesReceived || 0,
      invoicesReceivedQuantity: item.invoicesReceivedQuantity || 0,
      distributions: item.distributions || 0,
      distributionsQuantity: item.distributionsQuantity || 0,
      transfersToPharmacy: item.transfersToPharmacy || 0,
      transfersToPharmacyQuantity: item.transfersToPharmacyQuantity || 0,
    }));
    console.log("📈 Processed Monthly Data:", processed);
    return processed;
  }, [monthlyTrendsResponse]);

  const isLoading =
    (statsLoading ||
      dashboardLoading ||
      chartOneWeekLoading ||
      chartTodayYesterdayLoading ||
      monthlyTrendsLoading) &&
    !stats &&
    !dashboardStats &&
    !chartOneWeekData &&
    !chartTodayYesterdayData &&
    !chartMonthlyData;

  const isFetching =
    statsFetching ||
    dashboardFetching ||
    chartOneWeekFetching ||
    chartTodayYesterdayFetching ||
    monthlyTrendsFetching;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchDashboard(),
        refetchChartOneWeek(),
        refetchChartTodayYesterday(),
        refetchMonthlyTrends(),
      ]);
    } finally {
      setIsRefreshing(false);
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
              name === "pending"
                ? "Chờ nhận"
                : name === "sent"
                ? "Đã nhận"
                : name === "paid"
                ? "Đã thanh toán"
                : name,
            value: value || 0,
          }))
          .filter((item) => item.value > 0)
      : [];

  // Prepare transfer to pharmacy status data
  const transferStatusData = displayStats?.transfersToPharmacy?.byStatus
    ? Object.entries(displayStats.transfersToPharmacy.byStatus)
        .map(([name, value]) => ({
          name:
            name === "draft"
              ? "Nháp"
              : name === "sent"
              ? "Đã gửi"
              : name === "paid"
              ? "Đã thanh toán"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  // Prepare distribution status data
  const distributionStatusData = displayStats?.distributions?.byStatus
    ? Object.entries(displayStats.distributions.byStatus)
        .map(([name, value]) => ({
          name:
            name === "pending"
              ? "Chờ xử lý"
              : name === "confirmed"
              ? "Đã xác nhận"
              : name === "delivered"
              ? "Đã giao"
              : name === "in_transit"
              ? "Đang vận chuyển"
              : name === "rejected"
              ? "Từ chối"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];
  return {
    isRefreshing,
    handleRefresh,
    isLoading,
    isFetching,
    stats,
    dashboardStats,
    displayStats,
    chartOneWeekData,
    chartTodayYesterdayData,
    chartMonthlyData,
    invoiceStatusData,
    transferStatusData,
    distributionStatusData,
  };
};
