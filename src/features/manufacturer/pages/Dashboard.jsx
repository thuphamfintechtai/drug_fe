import { motion } from "framer-motion";
// eslint-disable-next-line import/no-unresolved
import Chart from "react-apexcharts";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { COLORS, CHART_COLORS } from "../constants/color";
import { useDashboard } from "../hooks/useDashboard";
import { navigationItems } from "../constants/navigationDashBoard";

export default function ManufacturerDashboard() {
  const {
    loading,
    error,
    loadAllData,
    displayStats,
    nftStatusData,
    transferStatusData,
    chartData,
  } = useDashboard();
  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Prepare NFT status data for pie chart

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={0.5} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
                Quản lý nhà sản xuất
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Tổng quan hệ thống và các chức năng chính
              </p>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 text-lg mb-4">
                {error?.message || "Đã xảy ra lỗi không xác định"}
              </p>
              <button
                onClick={loadAllData}
                className="px-6 py-2.5 bg-red-600 !text-white rounded-lg hover:bg-red-700 transition"
              >
                Thử lại
              </button>
            </div>
          ) : displayStats ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <motion.div
                variants={fadeUp}
                initial={{ opacity: 0 }}
                animate="show"
              >
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Tổng quan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.secondary}, ${COLORS.third})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng thuốc
                      </div>
                      <div
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary }}
                      >
                        {displayStats?.overview?.totalDrugs ||
                          displayStats?.drugs?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Hoạt động:{" "}
                        {displayStats?.overview?.activeDrugs ||
                          displayStats?.drugs?.active ||
                          0}
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.purple}, ${COLORS.pink})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng sản xuất
                      </div>
                      <div className="text-3xl font-bold text-purple-600">
                        {displayStats?.overview?.totalProductions ||
                          displayStats?.productions?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Lô hàng</div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.cyan}, ${COLORS.sky})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng NFT
                      </div>
                      <div className="text-3xl font-bold text-cyan-600">
                        {displayStats?.overview?.totalNFTs ||
                          displayStats?.nfts?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Token đã mint
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.emerald}, ${COLORS.green})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng chuyển giao
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {displayStats?.overview?.totalTransfers ||
                          displayStats?.transfers?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Giao dịch
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Charts Row 1: Area Chart (7 days) and Bar Chart (Today vs Yesterday) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={fadeUp}
                  initial={{ opacity: 0 }}
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Sản xuất 7 ngày gần nhất
                  </h3>
                  {chartData.oneWeek && chartData.oneWeek.length > 0 ? (
                    <Chart
                      type="area"
                      height={300}
                      series={[
                        {
                          name: "Số lô",
                          data: chartData.oneWeek.map((item) => item.count),
                        },
                      ]}
                      options={{
                        chart: {
                          type: "area",
                          height: 300,
                          toolbar: { show: false },
                          zoom: { enabled: false },
                          sparkline: { enabled: false },
                          animations: {
                            enabled: true,
                            easing: "easeinout",
                            speed: 800,
                            animateGradually: {
                              enabled: true,
                              delay: 150,
                            },
                            dynamicAnimation: {
                              enabled: true,
                              speed: 350,
                            },
                          },
                        },
                        colors: [COLORS.secondary],
                        fill: {
                          type: "gradient",
                          gradient: {
                            shadeIntensity: 1,
                            opacityFrom: 0.7,
                            opacityTo: 0.2,
                            stops: [0, 90, 100],
                            colorStops: [
                              {
                                offset: 0,
                                color: COLORS.secondary,
                                opacity: 0.8,
                              },
                              {
                                offset: 50,
                                color: COLORS.third,
                                opacity: 0.5,
                              },
                              {
                                offset: 100,
                                color: COLORS.secondary,
                                opacity: 0.1,
                              },
                            ],
                          },
                        },
                        stroke: {
                          curve: "smooth",
                          width: 3,
                          colors: [COLORS.secondary],
                        },
                        dataLabels: { enabled: false },
                        markers: {
                          size: 5,
                          colors: [COLORS.secondary],
                          strokeColors: "#fff",
                          strokeWidth: 2,
                          hover: { size: 7 },
                        },
                        xaxis: {
                          categories: chartData.oneWeek.map(
                            (item) => item.date
                          ),
                          labels: {
                            style: {
                              colors: "#6b7280",
                              fontSize: "11px",
                            },
                          },
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        yaxis: {
                          labels: {
                            style: {
                              colors: "#6b7280",
                              fontSize: "11px",
                            },
                          },
                        },
                        grid: {
                          borderColor: "#e5e7eb",
                          strokeDashArray: 3,
                          xaxis: { lines: { show: false } },
                          yaxis: { lines: { show: true } },
                          padding: { top: 0, right: 0, bottom: 0, left: 0 },
                        },
                        tooltip: {
                          theme: "light",
                          style: {
                            fontSize: "12px",
                          },
                          y: {
                            formatter: (val) => `${val} lô`,
                          },
                        },
                        legend: {
                          show: true,
                          position: "top",
                          fontSize: "12px",
                          fontWeight: 500,
                          markers: {
                            width: 8,
                            height: 8,
                            radius: 4,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      Chưa có dữ liệu
                    </div>
                  )}
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial={{ opacity: 0 }}
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    So sánh hôm nay và hôm qua
                  </h3>
                  {chartData.todayYesterday ? (
                    <Chart
                      type="bar"
                      height={300}
                      series={[
                        {
                          name: "Số lô sản xuất",
                          data: chartData.todayYesterday.map(
                            (item) => item.count
                          ),
                        },
                      ]}
                      options={{
                        chart: {
                          type: "bar",
                          height: 300,
                          toolbar: { show: false },
                          zoom: { enabled: false },
                          animations: {
                            enabled: true,
                            easing: "easeinout",
                            speed: 800,
                          },
                        },
                        colors: [COLORS.third],
                        fill: {
                          type: "gradient",
                          gradient: {
                            shade: "light",
                            type: "vertical",
                            shadeIntensity: 0.5,
                            gradientToColors: [COLORS.secondary],
                            stops: [0, 100],
                          },
                        },
                        plotOptions: {
                          bar: {
                            borderRadius: 8,
                            columnWidth: "60%",
                            dataLabels: {
                              position: "top",
                            },
                          },
                        },
                        dataLabels: {
                          enabled: false,
                        },
                        xaxis: {
                          categories: chartData.todayYesterday.map(
                            (item) => item.name
                          ),
                          labels: {
                            style: {
                              colors: "#6b7280",
                              fontSize: "11px",
                            },
                          },
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                        },
                        yaxis: {
                          labels: {
                            style: {
                              colors: "#6b7280",
                              fontSize: "11px",
                            },
                          },
                        },
                        grid: {
                          borderColor: "#e5e7eb",
                          strokeDashArray: 3,
                          xaxis: { lines: { show: false } },
                          yaxis: { lines: { show: true } },
                          padding: { top: 0, right: 0, bottom: 0, left: 0 },
                        },
                        tooltip: {
                          theme: "light",
                          style: {
                            fontSize: "12px",
                          },
                          y: {
                            formatter: (val) => `${val} lô`,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      Chưa có dữ liệu
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Charts Row 2: Pie Charts for NFT Status and Transfer Status */}
              <div className="grid grid-cols-1">
                <motion.div
                  variants={fadeUp}
                  initial={{ opacity: 0 }}
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Phân bố NFT theo trạng thái
                  </h3>
                  {nftStatusData.length > 0 ? (
                    <Chart
                      type="donut"
                      height={300}
                      series={nftStatusData.map((item) => item.value)}
                      options={{
                        chart: {
                          type: "donut",
                          height: 300,
                          animations: {
                            enabled: true,
                            easing: "easeinout",
                            speed: 800,
                            animateGradually: {
                              enabled: true,
                              delay: 150,
                            },
                          },
                        },
                        colors: CHART_COLORS,
                        labels: nftStatusData.map((item) => item.name),
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "65%",
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#1f2937",
                                },
                                value: {
                                  show: true,
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  color: "#4b5563",
                                  formatter: (val) => val,
                                },
                                total: {
                                  show: true,
                                  label: "Tổng",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#6b7280",
                                  formatter: () => {
                                    const total = nftStatusData.reduce(
                                      (sum, item) => sum + item.value,
                                      0
                                    );
                                    return total.toString();
                                  },
                                },
                              },
                            },
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: "12px",
                            fontWeight: 600,
                            colors: ["#fff"],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            opacity: 0.45,
                          },
                        },
                        legend: {
                          show: true,
                          position: "bottom",
                          fontSize: "12px",
                          fontWeight: 500,
                          markers: {
                            width: 10,
                            height: 10,
                            radius: 5,
                          },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 5,
                          },
                        },
                        tooltip: {
                          theme: "light",
                          style: {
                            fontSize: "12px",
                          },
                          y: {
                            formatter: (val, { seriesIndex }) => {
                              const total = nftStatusData.reduce(
                                (sum, item) => sum + item.value,
                                0
                              );
                              const percentage = ((val / total) * 100).toFixed(
                                1
                              );
                              return `${val} (${percentage}%)`;
                            },
                          },
                        },
                        stroke: {
                          show: true,
                          width: 3,
                          colors: ["#fff"],
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      Chưa có dữ liệu
                    </div>
                  )}
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial={{ opacity: 0 }}
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Phân bố chuyển giao theo trạng thái
                  </h3>
                  {transferStatusData.length > 0 ? (
                    <Chart
                      type="donut"
                      height={300}
                      series={transferStatusData.map((item) => item.value)}
                      options={{
                        chart: {
                          type: "donut",
                          height: 300,
                          animations: {
                            enabled: true,
                            easing: "easeinout",
                            speed: 800,
                            animateGradually: {
                              enabled: true,
                              delay: 150,
                            },
                          },
                        },
                        colors: CHART_COLORS,
                        labels: transferStatusData.map((item) => item.name),
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "65%",
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#1f2937",
                                },
                                value: {
                                  show: true,
                                  fontSize: "20px",
                                  fontWeight: 700,
                                  color: "#4b5563",
                                  formatter: (val) => val,
                                },
                                total: {
                                  show: true,
                                  label: "Tổng",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#6b7280",
                                  formatter: () => {
                                    const total = transferStatusData.reduce(
                                      (sum, item) => sum + item.value,
                                      0
                                    );
                                    return total.toString();
                                  },
                                },
                              },
                            },
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: "12px",
                            fontWeight: 600,
                            colors: ["#fff"],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            opacity: 0.45,
                          },
                        },
                        legend: {
                          show: true,
                          position: "bottom",
                          fontSize: "12px",
                          fontWeight: 500,
                          markers: {
                            width: 10,
                            height: 10,
                            radius: 5,
                          },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 5,
                          },
                        },
                        tooltip: {
                          theme: "light",
                          style: {
                            fontSize: "12px",
                          },
                          y: {
                            formatter: (val, { seriesIndex }) => {
                              const total = transferStatusData.reduce(
                                (sum, item) => sum + item.value,
                                0
                              );
                              const percentage = ((val / total) * 100).toFixed(
                                1
                              );
                              return `${val} (${percentage}%)`;
                            },
                          },
                        },
                        stroke: {
                          show: true,
                          width: 3,
                          colors: ["#fff"],
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      Chưa có dữ liệu
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Monthly Trends Chart */}
              {chartData.monthly && chartData.monthly.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  initial={{ opacity: 0 }}
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Xu hướng 6 tháng gần nhất
                  </h3>
                  <Chart
                    type="line"
                    height={400}
                    series={[
                      {
                        name: "Sản xuất",
                        data: chartData.monthly.map((item) => item.productions),
                      },
                      {
                        name: "Chuyển giao",
                        data: chartData.monthly.map((item) => item.transfers),
                      },
                    ]}
                    options={{
                      chart: {
                        type: "line",
                        height: 400,
                        toolbar: { show: false },
                        zoom: { enabled: false },
                        animations: {
                          enabled: true,
                          easing: "easeinout",
                          speed: 800,
                          animateGradually: {
                            enabled: true,
                            delay: 150,
                          },
                          dynamicAnimation: {
                            enabled: true,
                            speed: 350,
                          },
                        },
                      },
                      colors: [COLORS.secondary, COLORS.third],
                      stroke: {
                        curve: "smooth",
                        width: 3,
                      },
                      fill: {
                        type: "gradient",
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.6,
                          opacityTo: 0.1,
                          stops: [0, 90, 100],
                          colorStops: [
                            [
                              {
                                offset: 0,
                                color: COLORS.secondary,
                                opacity: 0.6,
                              },
                              {
                                offset: 100,
                                color: COLORS.secondary,
                                opacity: 0.1,
                              },
                            ],
                            [
                              {
                                offset: 0,
                                color: COLORS.third,
                                opacity: 0.6,
                              },
                              {
                                offset: 100,
                                color: COLORS.third,
                                opacity: 0.1,
                              },
                            ],
                          ],
                        },
                      },
                      markers: {
                        size: 6,
                        colors: [COLORS.secondary, COLORS.third],
                        strokeColors: "#fff",
                        strokeWidth: 2,
                        hover: { size: 8 },
                      },
                      dataLabels: { enabled: false },
                      xaxis: {
                        categories: chartData.monthly.map((item) => item.month),
                        labels: {
                          style: {
                            colors: "#6b7280",
                            fontSize: "11px",
                          },
                        },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: {
                        labels: {
                          style: {
                            colors: "#6b7280",
                            fontSize: "11px",
                          },
                        },
                      },
                      grid: {
                        borderColor: "#e5e7eb",
                        strokeDashArray: 3,
                        xaxis: { lines: { show: false } },
                        yaxis: { lines: { show: true } },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                      },
                      tooltip: {
                        theme: "light",
                        style: {
                          fontSize: "12px",
                        },
                        shared: true,
                        intersect: false,
                        y: {
                          formatter: (val) => `${val} lô`,
                        },
                      },
                      legend: {
                        show: true,
                        position: "top",
                        fontSize: "12px",
                        fontWeight: 500,
                        markers: {
                          width: 8,
                          height: 8,
                          radius: 4,
                        },
                      },
                    }}
                  />
                </motion.div>
              )}

              {/* Detailed Statistics Cards */}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Không có dữ liệu
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
