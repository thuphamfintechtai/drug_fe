import { useEffect, useState } from "react";
import { distributorQueries } from "../apis/distributor";
import { toast } from "sonner";

export const useStats = () => {
  const [distributionStats, setDistributionStats] = useState({});
  const [invoiceStats, setInvoiceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { mutateAsync: fetchDistributionStats } =
    distributorQueries.getDistributionStats();
  const { mutateAsync: fetchInvoiceStats } =
    distributorQueries.getInvoiceStats();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [distRes, invRes] = await Promise.all([
        fetchDistributionStats(),
        fetchInvoiceStats(),
      ]);

      const distData = distRes?.data?.data || distRes?.data || {};
      const invData = invRes?.data?.data || invRes?.data || {};

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
