import { useEffect, useState } from "react";
import { useDistributorDistributionStats, useDistributorMyInvoices } from "../apis/distributor";
import { toast } from "sonner";
import api from "../../utils/api";

export const useStats = () => {
  const [distributionStats, setDistributionStats] = useState({});
  const [invoiceStats, setInvoiceStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { data: distributionStatsData, isLoading: distLoading } = useDistributorDistributionStats();
  const { data: invoiceStatsData, isLoading: invLoading } = useDistributorMyInvoices({ limit: 1 });

  useEffect(() => {
    if (!distLoading && !invLoading) {
      loadStats();
    }
  }, [distLoading, invLoading, distributionStatsData, invoiceStatsData]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get distribution stats from query or API directly
      const distData = distributionStatsData?.data || {};
      
      // Get invoice stats from API directly
      const invoiceResponse = await api.get("/distributor/invoices", { params: { limit: 1 } });
      const invData = invoiceResponse?.data?.data || {};

      setDistributionStats({
        totalDistributions: distData.totalDistributions || distData.total || 0,
        confirmedDistributions:
          distData.statusBreakdown?.find((s) => s._id === "confirmed")?.count ||
          distData.confirmed ||
          0,
        pendingDistributions:
          distData.statusBreakdown?.find((s) => s._id === "pending")?.count ||
          distData.pending ||
          0,
        totalQuantity: distData.totalQuantity || distData.quantity || 0,
      });

      setInvoiceStats({
        totalInvoices: invData.totalInvoices || invData.total || 0,
        paidInvoices:
          invData.statusBreakdown?.find((s) => s._id === "paid")?.count ||
          invData.paid ||
          0,
        pendingInvoices:
          invData.statusBreakdown?.find((s) => s._id === "pending")?.count ||
          invData.pending ||
          0,
        totalRevenue: invData.totalRevenue || invData.revenue || 0,
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
      toast.error("Không tải được thống kê!");
    } finally {
      setLoading(false);
    }
  };

  return {
    distributionStats,
    invoiceStats,
    loading,
  };
};
