import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDrug } from "../hooks/useDrug";
import { navigationItems } from "../constants/constant";
export default function Drugs() {
  const {
    loading,
    searchAtc,
    loadingProgress,
    handleSearch,
    safeDrugs,
    setSearchAtc,
    loadDrugs,
  } = useDrug();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative px-6 py-8 md:px-10 md:py-10 lg:py-12 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
                Quản lý thuốc
              </h1>
              <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
                Xem thông tin thuốc và tìm kiếm theo tên thương mại, tên hoạt
                chất, mã ATC
              </p>
            </div>
          </motion.section>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 sm:items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Tìm kiếm
              </label>
              <div className="relative flex items-stretch gap-0">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchAtc}
                    onChange={(e) => setSearchAtc(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
                    className="w-full h-14 pl-12 pr-4 rounded-l-xl border-2 border-r-0 border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition text-base"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-14 px-6 rounded-r-xl border-2 border-l-0 border-slate-300 !text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition font-semibold whitespace-nowrap"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2 sm:invisible">
                &nbsp;
              </label>
              <button
                onClick={() => {
                  setSearchAtc("");
                  loadDrugs();
                }}
                className="h-14 px-6 rounded-xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold transition whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <style>{`
              .scrollbar-thin {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
              }
              .scrollbar-thin::-webkit-scrollbar {
                height: 8px;
                width: 8px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
            {safeDrugs.length === 0 ? (
              <div className="p-8 md:p-16 flex flex-col items-center justify-center">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 md:w-16 md:h-16 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 7h18M5 10h14M4 14h16M6 18h12"
                    />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">
                  Không có dữ liệu
                </h3>
                <p className="text-slate-500 text-sm text-center px-4">
                  Không tìm thấy thuốc nào phù hợp với từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto scrollbar-thin">
                <div className="inline-block min-w-full">
                  <table
                    className="w-full border-collapse"
                    style={{ minWidth: "1000px" }}
                  >
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Tên thương mại
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                          Tên hoạt chất
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Mã ATC
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Dạng bào chế
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Hàm lượng
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-slate-100">
                      {safeDrugs.map((drug, index) => (
                        <tr
                          key={drug._id || index}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                            {drug.tradeName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {drug.genericName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              {drug.atcCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            {drug.dosageForm}
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            {drug.strength}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                drug.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {drug.status === "active"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
