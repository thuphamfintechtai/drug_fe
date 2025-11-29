import { useMemo, useState } from "react";
import {
  useDistributorStatistics,
  useDistributorDashboardStats,
  useDistributorChartOneWeek,
  useDistributorChartTodayYesterday,
  useDistributorMonthlyTrends,
} from "../apis/distributor";

export const useDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useDistributorStatistics();

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    refetch: refetchDashboard,
  } = useDistributorDashboardStats();

  const {
    data: chartOneWeekResponse,
    isLoading: chartOneWeekLoading,
    isFetching: chartOneWeekFetching,
    refetch: refetchChartOneWeek,
  } = useDistributorChartOneWeek();

  const {
    data: chartTodayYesterdayResponse,
    isLoading: chartTodayYesterdayLoading,
    isFetching: chartTodayYesterdayFetching,
    refetch: refetchChartTodayYesterday,
  } = useDistributorChartTodayYesterday();

  const {
    data: monthlyTrendsResponse,
    isLoading: monthlyTrendsLoading,
    isFetching: monthlyTrendsFetching,
    refetch: refetchMonthlyTrends,
  } = useDistributorMonthlyTrends(6);

  const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

  const stats = unwrap(statsResponse);
  const dashboardStats = unwrap(dashboardResponse);

  console.log("Dashboard Stats Response:", dashboardResponse);
  console.log("Dashboard Stats Data:", dashboardStats);

  const chartOneWeekData = useMemo(() => {
    const data = unwrap(chartOneWeekResponse);
    console.log("One Week Response:", chartOneWeekResponse);
    console.log("One Week Data:", data);
    
    // Kiểm tra nếu dailyStats là mảng (format mới)
    if (Array.isArray(data?.dailyStats)) {
      const formatted = data.dailyStats.map((stat) => {
        const dateObj = new Date(stat.date);
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
    }
    
    // Fallback cho format cũ (object)
    if (data?.dailyStats && typeof data.dailyStats === 'object') {
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
    }
    
    console.log("No dailyStats found");
    return null;
  }, [chartOneWeekResponse]);

  const chartTodayYesterdayData = useMemo(() => {
    const data = unwrap(chartTodayYesterdayResponse);
    console.log("Today/Yesterday Response:", chartTodayYesterdayResponse);
    console.log("Today/Yesterday Data:", data);
    if (!data) {
      console.log("No today/yesterday data");
      return null;
    }
    return [
      { name: "Hôm qua", count: data.yesterdayCount || 0 },
      { name: "Hôm nay", count: data.todayCount || 0 },
    ];
  }, [chartTodayYesterdayResponse]);

  const chartMonthlyData = useMemo(() => {
    const data = unwrap(monthlyTrendsResponse);
    console.log("Monthly Trends Response:", monthlyTrendsResponse);
    console.log("Monthly Trends Data:", data);
    if (!data?.trends) {
      console.log("No trends data found");
      return null;
    }
    const mapped = (data.trends || []).map((item) => ({
      month: item.month,
      invoicesReceived: item.invoicesReceived || 0,
      invoicesReceivedQuantity: item.invoicesReceivedQuantity || 0,
      distributions: item.distributions || 0,
      distributionsQuantity: item.distributionsQuantity || 0,
      transfersToPharmacy: item.transfersToPharmacy || 0,
      transfersToPharmacyQuantity: item.transfersToPharmacyQuantity || 0,
    }));
    console.log(" Mapped Monthly Data:", mapped);
    return mapped;
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
  const overview = displayStats?.overview || displayStats;

  console.log("Display Stats:", displayStats);
  console.log("Overview:", overview);
  console.log("Invoices Received:", overview?.invoicesReceived);
  console.log("Invoices:", overview?.invoices);
  console.log("Transfers to Pharmacy:", overview?.transfersToPharmacy);
  console.log("Distributions:", overview?.distributions);

  const invoiceStatusData = useMemo(() => {
    const byStatus = overview?.invoicesReceived?.byStatus || overview?.invoices?.byStatus || displayStats?.invoicesReceived?.byStatus || displayStats?.invoices?.byStatus;
    console.log("Invoice byStatus:", byStatus);
    if (!byStatus || typeof byStatus !== 'object') {
      console.log("No invoice byStatus found");
      return [];
    }
    const data = Object.entries(byStatus)
      .map(([name, value]) => ({
        name:
          name === "draft"
            ? "Nháp"
            : name === "pending"
            ? "Chờ nhận"
            : name === "issued"
            ? "Đã phát hành"
            : name === "confirmed"
            ? "Đã xác nhận"
            : name === "sent"
            ? "Đã nhận"
            : name === "delivered"
            ? "Đã giao"
            : name === "paid"
            ? "Đã thanh toán"
            : name === "cancelled"
            ? "Đã hủy"
            : name,
        value: Number(value) || 0,
      }))
      .filter(item => item.value > 0); // Chỉ hiển thị các mục có giá trị > 0
    console.log("Invoice Status Data:", data);
    return data;
  }, [overview, displayStats]);

  // Prepare transfer to pharmacy status data
  const transferStatusData = useMemo(() => {
    const byStatus = overview?.transfersToPharmacy?.byStatus || displayStats?.transfersToPharmacy?.byStatus;
    console.log("Transfer byStatus:", byStatus);
    if (!byStatus || typeof byStatus !== 'object') {
      console.log("No transfer byStatus found");
      return [];
    }
    const data = Object.entries(byStatus)
      .map(([name, value]) => ({
        name:
          name === "draft"
            ? "Nháp"
            : name === "issued"
            ? "Đã phát hành"
            : name === "sent"
            ? "Đã gửi"
            : name === "paid"
            ? "Đã thanh toán"
            : name === "cancelled"
            ? "Đã hủy"
            : name,
        value: Number(value) || 0,
      }))
      .filter(item => item.value > 0); // Chỉ hiển thị các mục có giá trị > 0
    console.log("Transfer Status Data:", data);
    return data;
  }, [overview, displayStats]);

  // Prepare distribution status data
  const distributionStatusData = useMemo(() => {
    const byStatus = overview?.distributions?.byStatus || displayStats?.distributions?.byStatus;
    console.log("Distribution byStatus:", byStatus);
    if (!byStatus || typeof byStatus !== 'object') {
      console.log("No distribution byStatus found");
      return [];
    }
    const data = Object.entries(byStatus)
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
        value: Number(value) || 0,
      }))
      .filter(item => item.value > 0); // Chỉ hiển thị các mục có giá trị > 0
    console.log("Distribution Status Data:", data);
    return data;
  }, [overview, displayStats]);
  return {
    isRefreshing,
    handleRefresh,
    isLoading,
    isFetching,
    displayStats,
    overview,
    stats,
    dashboardStats,
    chartOneWeekData,
    chartTodayYesterdayData,
    chartMonthlyData,
    invoiceStatusData,
    transferStatusData,
    distributionStatusData,
  };
};
