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

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

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
        api.get("/statistics/performance", {
          params: { startDate: startDateStr, endDate: endDateStr },
        }),
        api.get("/pharmacy/chart/one-week"),
        api.get("/pharmacy/chart/today-yesterday"),
        api.get("/statistics/monthly-trends", { params: { months: 6 } }),
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
        const dashboardData = dashboardStatsResponse.value.data.data;
        console.log("Pharmacy Dashboard Stats Response:", dashboardStatsResponse.value);
        console.log("Pharmacy Dashboard Stats Data:", dashboardData);
        setDashboardStats(dashboardData);
      }

      if (
        qualityStatsResponse.status === "fulfilled" &&
        qualityStatsResponse.value.data?.success
      ) {
        setQualityStats(qualityStatsResponse.value.data.data);
      }

      // Handle oneWeek chart data - process dailyStats (can be object or array)
      if (
        oneWeekResponse.status === "fulfilled" &&
        oneWeekResponse.value.data?.success
      ) {
        const data = oneWeekResponse.value.data.data;
        console.log("Pharmacy One Week Response:", oneWeekResponse.value);
        console.log("Pharmacy One Week Data:", data);
        let oneWeekData = [];
        
        // Check if dailyStats is an array (new format)
        if (Array.isArray(data?.dailyStats)) {
          oneWeekData = data.dailyStats.map((stat) => {
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
          oneWeekData = oneWeekData
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ sortKey, ...rest }) => rest);
        }
        // Check if dailyStats is an object (old format)
        else if (data?.dailyStats && typeof data.dailyStats === "object") {
          oneWeekData = Object.entries(data.dailyStats).map(([date, stat]) => {
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
          oneWeekData = oneWeekData
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ sortKey, ...rest }) => rest);
        }
        // Fallback: check if data is already an array
        else if (Array.isArray(data)) {
          oneWeekData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          oneWeekData = data.data;
        }
        
        console.log("Pharmacy One Week Formatted Data:", oneWeekData);
        setChartData((prev) => ({
          ...prev,
          oneWeek: oneWeekData,
        }));
      } else {
        console.log("Pharmacy One Week Response failed:", oneWeekResponse);
        setChartData((prev) => ({ ...prev, oneWeek: [] }));
      }

      // Handle todayYesterday chart data - format as array
      if (
        todayYesterdayResponse.status === "fulfilled" &&
        todayYesterdayResponse.value.data?.success
      ) {
        const data = todayYesterdayResponse.value.data.data;
        console.log("Pharmacy Today/Yesterday Response:", todayYesterdayResponse.value);
        console.log("Pharmacy Today/Yesterday Data:", data);
        let todayYesterdayData = [];
        
        // If data has todayCount and yesterdayCount, format them
        if (data?.todayCount !== undefined || data?.yesterdayCount !== undefined) {
          todayYesterdayData = [
            { name: "Hôm qua", count: data.yesterdayCount || 0 },
            { name: "Hôm nay", count: data.todayCount || 0 },
          ];
        }
        // Fallback: check if data is already an array
        else if (Array.isArray(data)) {
          todayYesterdayData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          todayYesterdayData = data.data;
        } else if (data?.chart && Array.isArray(data.chart)) {
          todayYesterdayData = data.chart;
        }
        
        console.log("Pharmacy Today/Yesterday Formatted Data:", todayYesterdayData);
        setChartData((prev) => ({
          ...prev,
          todayYesterday: todayYesterdayData,
        }));
      } else {
        console.log("Pharmacy Today/Yesterday Response failed:", todayYesterdayResponse);
        setChartData((prev) => ({ ...prev, todayYesterday: [] }));
      }

      // Handle monthly chart data - process trends
      if (
        monthlyResponse.status === "fulfilled" &&
        monthlyResponse.value.data?.success
      ) {
        const data = monthlyResponse.value.data.data;
        let formattedData = [];
        
        // Check if trends is an array
        if (data?.trends && Array.isArray(data.trends)) {
          formattedData = data.trends.map((item) => ({
            month: item.month || item.date || "",
            receipts: item.receipts || item.count || item.receiptsReceived || 0,
          }));
        }
        // Fallback: check if data is already an array
        else if (Array.isArray(data)) {
          formattedData = data;
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

  // Helper function to unwrap nested data
  const unwrap = (response) => {
    if (!response) return null;
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response;
  };

  // Get overview data (similar to distributor dashboard)
  const overview = displayStats?.overview || {};

  // Invoice status data - check both overview and direct paths
  const invoiceStatusData = (() => {
    const byStatus =
      overview?.invoicesReceived?.byStatus ||
      displayStats?.invoicesReceived?.byStatus ||
      displayStats?.invoices?.byStatus ||
      {};
    
    console.log("Pharmacy Invoice Status Data - Overview:", overview);
    console.log("Pharmacy Invoice Status Data - DisplayStats:", displayStats);
    console.log("Pharmacy Invoice Status Data - ByStatus:", byStatus);
    
    if (!byStatus || Object.keys(byStatus).length === 0) {
      console.log("No invoice status data found");
      return [];
    }
    
    const result = Object.entries(byStatus)
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
            : name === "pending"
            ? "Chờ xử lý"
            : name === "confirmed"
            ? "Đã xác nhận"
            : name,
        value: value || 0,
      }))
      .filter((item) => item.value > 0);
    
    console.log("Pharmacy Invoice Status Data - Result:", result);
    return result;
  })();

  // NFT status data
  const nftStatusData = (() => {
    const byStatus =
      overview?.nfts?.byStatus ||
      displayStats?.nfts?.byStatus ||
      {};
    
    console.log("Pharmacy NFT Status Data - Overview:", overview);
    console.log("Pharmacy NFT Status Data - DisplayStats:", displayStats);
    console.log("Pharmacy NFT Status Data - ByStatus:", byStatus);
    console.log("Pharmacy NFT Status Data - Overview.nfts:", overview?.nfts);
    console.log("Pharmacy NFT Status Data - DisplayStats.nfts:", displayStats?.nfts);
    
    if (!byStatus || Object.keys(byStatus).length === 0) {
      console.log("No NFT status data found - byStatus is empty or undefined");
      return [];
    }
    
    const mapped = Object.entries(byStatus)
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
      }));
    
    console.log("Pharmacy NFT Status Data - Mapped (before filter):", mapped);
    
    const filtered = mapped.filter((item) => item.value > 0);
    
    console.log("Pharmacy NFT Status Data - Filtered (after filter):", filtered);
    
    return filtered;
  })();

  // Receipts status data
  const receiptsStatusData = (() => {
    const byStatus =
      overview?.receipts?.byStatus ||
      displayStats?.receipts?.byStatus ||
      {};
    
    if (!byStatus || Object.keys(byStatus).length === 0) return [];
    
    return Object.entries(byStatus)
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
      .filter((item) => item.value > 0);
  })();

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
