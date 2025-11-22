/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";

export const useDashboard = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [registrationStats, setRegistrationStats] = useState(null);
  const [drugStats, setDrugStats] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [complianceStats, setComplianceStats] = useState(null);
  const [alertsStats, setAlertsStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadAllStats();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadAllStats = async () => {
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

      const [
        sysRes,
        regRes,
        drugRes,
        monthlyRes,
        blockchainRes,
        complianceRes,
        alertsRes,
      ] = await Promise.allSettled([
        api.get("/admin/statistics"),
        api.get("/admin/registration/statistics"),
        api.get("/admin/drugs/statistics"),
        api.get("/statistics/trends/monthly", { params: { months: 6 } }),
        api.get("/statistics/compliance"),
        api.get("/statistics/compliance"),
        api.get("/statistics/alerts"),
      ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (sysRes.status === "fulfilled" && sysRes.value?.data?.success) {
        setSystemStats(sysRes.value.data.data);
      }
      if (regRes.status === "fulfilled" && regRes.value?.data?.success) {
        setRegistrationStats(regRes.value.data.data);
      }
      if (drugRes.status === "fulfilled" && drugRes.value?.data?.success) {
        setDrugStats(drugRes.value.data.data);
      }
      if (monthlyRes.status === "fulfilled" && monthlyRes.value?.data?.success) {
        const data = monthlyRes.value.data.data;
        const formattedData = (data.trends || []).map((item) => ({
          month: item.month,
          productions: item.productions || 0,
          transfers: item.transfers || 0,
          receipts: item.receipts || 0,
        }));
        setMonthlyTrends(formattedData);
      }
      if (blockchainRes.status === "fulfilled" && blockchainRes.value?.data?.success) {
        setBlockchainStats(blockchainRes.value.data.data);
      }
      if (complianceRes.status === "fulfilled" && complianceRes.value?.data?.success) {
        setComplianceStats(complianceRes.value.data.data);
      }
      if (alertsRes.status === "fulfilled" && alertsRes.value?.data?.success) {
        setAlertsStats(alertsRes.value.data.data);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Error loading admin stats:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  return {
    systemStats,
    registrationStats,
    drugStats,
    blockchainStats,
    complianceStats,
    alertsStats,
    monthlyTrends,
    loading,
    loadingProgress,
  };
};

export default useDashboard;
