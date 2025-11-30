import { useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useDistributions } from "../hooks/useDistributions.jsx";
import TruckLoader from "../../shared/components/TruckLoader";
import TruckAnimationButton from "../../shared/components/TruckAnimationButton";
import { Search } from "../../shared/components/ui/search";
import { CardUI } from "../../shared/components/ui/cardUI";

export default function Distributions() {
  const navigate = useNavigate();
  const {
    loading,
    filteredData,
    searchText,
    setSearchText,
    data,
    showConfirmDialog,
    selectedRecord,
    isConfirming,
    confirmForm,
    setConfirmForm,
    confirmFormErrors,
    handleCloseConfirmDialog,
    handleSubmitConfirm,
    onConfirm,
  } = useDistributions();

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const handleSearch = useCallback(
    (searchValue = null) => {
      const term = (searchValue !== null ? searchValue : searchText)
        .trim()
        .toLowerCase();
      setSearchText(term);
    },
    [searchText, setSearchText]
  );

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, [setSearchText]);

  const getSearchText = useCallback((item) => {
    const drug =
      item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
    const drugName = drug?.name || drug?.tradeName || item.drugName || "";
    return (
      item.invoiceNumber || item.code || drugName || item.verificationCode || ""
    );
  }, []);

  const matchFunction = useCallback((item, searchLower) => {
    const drug =
      item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
    const drugName = (
      drug?.name ||
      drug?.tradeName ||
      item.drugName ||
      ""
    ).toLowerCase();
    const invoiceNumber = (item.invoiceNumber || item.code || "").toLowerCase();
    const verificationCode = (item.verificationCode || "").toLowerCase();
    const manufacturerId = (item.manufacturerId || "").toLowerCase();
    const drugId = (item.drugId || "").toLowerCase();
    return (
      invoiceNumber.includes(searchLower) ||
      drugName.includes(searchLower) ||
      verificationCode.includes(searchLower) ||
      manufacturerId.includes(searchLower) ||
      drugId.includes(searchLower)
    );
  }, []);

  const getDisplayText = useCallback((item, searchLower) => {
    const drug =
      item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
    const drugName = (
      drug?.name ||
      drug?.tradeName ||
      item.drugName ||
      ""
    ).toLowerCase();
    const invoiceNumber = (item.invoiceNumber || item.code || "").toLowerCase();
    const verificationCode = (item.verificationCode || "").toLowerCase();
    if (invoiceNumber.includes(searchLower)) {
      return item.invoiceNumber || item.code || "";
    }
    if (drugName.includes(searchLower)) {
      return drug?.name || drug?.tradeName || item.drugName || "";
    }
    if (verificationCode.includes(searchLower)) {
      return item.verificationCode || "";
    }
    return (
      item.invoiceNumber ||
      item.code ||
      drug?.name ||
      drug?.tradeName ||
      item.drugName ||
      ""
    );
  }, []);

  const getManufacturerDisplay = (record) => {
    return (
      record?.manufacturerName ||
      record?.manufacturer?.fullName ||
      record?.manufacturer?.name ||
      record?.manufacturer?.username ||
      record?.fromManufacturer?.fullName ||
      record?.fromManufacturer?.username ||
      record?.manufacturerId ||
      "N/A"
    );
  };

  const getInvoiceDisplay = (record) => {
    return record?.invoiceNumber || record?.code || record?._id || "N/A";
  };

  const getDrugDisplay = (record) => {
    const drug =
      record?.drug || record?.proofOfProduction?.drug || record?.nftInfo?.drug;
    return drug?.name || drug?.tradeName || record?.drugName || "N/A";
  };

  const getQuantityDisplay = (record) => {
    return record?.quantity || record?.distributedQuantity || "N/A";
  };

  const getDateDisplay = (value) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "N/A";

  const getStatusDisplay = (record) => {
    const status = (record?.status || "").toLowerCase();
    if (status === "confirmed" || record?.isConfirmed) {
      return { text: "Đã xác nhận", color: "green" };
    }
    if (status === "sent") {
      return { text: "Đã nhận", color: "blue" };
    }
    if (status === "issued") {
      return { text: "Đã phát hành", color: "cyan" };
    }
    if (status === "pending") {
      return { text: "Chờ xác nhận", color: "orange" };
    }
    if (status === "cancelled") {
      return { text: "Đã hủy", color: "red" };
    }
    return { text: "Chờ xác nhận", color: "yellow" };
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={50} showTrack />
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
                Đơn hàng nhận từ Nhà sản xuất
              </h1>
              <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
                Quản lý và xác nhận các đơn hàng nhận từ nhà sản xuất dược phẩm
              </p>
            </div>
          </motion.section>

          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="w-full">
              <Search
                searchInput={searchText}
                setSearchInput={setSearchText}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                placeholder="Tìm kiếm theo mã đơn, tên thuốc"
                data={data}
                getSearchText={getSearchText}
                matchFunction={matchFunction}
                getDisplayText={getDisplayText}
                enableAutoSearch={false}
              />
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
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
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Danh sách đơn hàng
              </h2>
            </div>

            {filteredData.length === 0 ? (
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">
                  Không có dữ liệu
                </h3>
                <p className="text-slate-500 text-sm text-center px-4">
                  {searchText
                    ? "Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm"
                    : "Chưa có đơn hàng nào"}
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
                          Mã đơn hàng
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Từ Manufacturer
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                          Tên thuốc
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Số lượng
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Ngày gửi
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredData.map((record, index) => {
                        const status = getStatusDisplay(record);
                        const recordId = record._id || record.id;
                        const currentStatus = (
                          record?.status || ""
                        ).toLowerCase();
                        const canConfirm =
                          (currentStatus === "sent" ||
                            currentStatus === "pending") &&
                          !record?.isConfirmed;
                        const isConfirmed =
                          currentStatus === "confirmed" || record?.isConfirmed;

                        return (
                          <tr
                            key={record._id || index}
                            className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                            onClick={(e) => {
                              // Không navigate nếu click vào button
                              if (e.target.closest("button")) {
                                return;
                              }
                              navigate(
                                `/distributor/distributions/${recordId}`
                              );
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                {getInvoiceDisplay(record)}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                              {getManufacturerDisplay(record)}
                            </td>
                            <td className="px-6 py-4 text-slate-700">
                              {getDrugDisplay(record)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-semibold text-slate-800">
                                {getQuantityDisplay(record)}
                              </span>
                              <span className="text-xs text-slate-500 ml-1">
                                NFT
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-sm whitespace-nowrap">
                              {getDateDisplay(
                                record.createdAt || record.sentDate
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  status.color === "green"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : status.color === "blue"
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : status.color === "cyan"
                                    ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                                    : status.color === "orange"
                                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                                    : status.color === "red"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                }`}
                              >
                                {status.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                {canConfirm ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onConfirm && onConfirm(record);
                                    }}
                                    className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/40"
                                  >
                                    Xác nhận
                                  </button>
                                ) : isConfirmed ? (
                                  <span className="px-4 py-2 rounded-xl font-semibold text-sm border-2 border-slate-300 text-slate-500 bg-slate-50">
                                    Đã nhận
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Confirm Receipt Dialog */}
      {showConfirmDialog && selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleCloseConfirmDialog}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-6 md:px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold !text-white mb-1">
                    Xác nhận hàng
                  </h2>
                  <p className="text-white/90 text-sm">
                    Đơn:{" "}
                    <span className="font-mono">
                      {getInvoiceDisplay(selectedRecord)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleCloseConfirmDialog}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {/* Thông tin đơn hàng */}
              <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-xl p-5 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Thông tin đơn hàng
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Mã đơn:
                    </span>
                    <span className="font-mono font-semibold text-slate-800 break-all">
                      {getInvoiceDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Từ:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {getManufacturerDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Tên thuốc:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {getDrugDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Số lượng gửi:
                    </span>
                    <span className="font-bold text-primary text-lg">
                      {getQuantityDisplay(selectedRecord)} NFT
                    </span>
                  </div>
                </div>
              </div>

              {/* Người nhận */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  Thông tin người nhận
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Người nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={confirmForm.receivedBy}
                    onChange={(e) => {
                      const value = e.target.value.replace(
                        /[^a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]/g,
                        ""
                      );
                      if (value.length <= 100) {
                        setConfirmForm({
                          ...confirmForm,
                          receivedBy: value,
                        });
                      }
                    }}
                    placeholder="Họ và tên người nhận"
                    maxLength={100}
                    className={`w-full h-14 border-2 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:outline-none transition-all duration-150 ${
                      confirmFormErrors.receivedBy
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 focus:ring-primary focus:border-primary hover:border-slate-400"
                    }`}
                  />
                  {confirmFormErrors.receivedBy && (
                    <p className="mt-1 text-xs text-red-600">
                      {confirmFormErrors.receivedBy}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Chức vụ (tuỳ chọn)
                  </label>
                  <input
                    value={confirmForm.receivedByTitle}
                    onChange={(e) =>
                      setConfirmForm({
                        ...confirmForm,
                        receivedByTitle: e.target.value
                          .replace(/[^a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]/g, "")
                          .slice(0, 50),
                      })
                    }
                    placeholder="VD: Kho vận"
                    maxLength={50}
                    className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition"
                  />
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  Địa chỉ giao hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Đường/Phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={confirmForm.deliveryAddress.street}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          deliveryAddress: {
                            ...confirmForm.deliveryAddress,
                            street: e.target.value.slice(0, 200),
                          },
                        });
                      }}
                      placeholder="Số nhà, đường..."
                      maxLength={200}
                      className={`w-full h-14 border-2 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:outline-none transition ${
                        confirmFormErrors.deliveryAddressStreet
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300 focus:ring-primary focus:border-primary hover:border-slate-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressStreet && (
                      <p className="mt-1 text-xs text-red-600">
                        {confirmFormErrors.deliveryAddressStreet}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={confirmForm.deliveryAddress.city}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          deliveryAddress: {
                            ...confirmForm.deliveryAddress,
                            city: e.target.value.slice(0, 100),
                          },
                        });
                      }}
                      placeholder="TP/Huyện"
                      maxLength={100}
                      className={`w-full h-14 border-2 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:outline-none transition ${
                        confirmFormErrors.deliveryAddressCity
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300 focus:ring-primary focus:border-primary hover:border-slate-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressCity && (
                      <p className="mt-1 text-xs text-red-600">
                        {confirmFormErrors.deliveryAddressCity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Quốc gia
                    </label>
                    <input
                      value={confirmForm.deliveryAddress.country}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          deliveryAddress: {
                            ...confirmForm.deliveryAddress,
                            country: e.target.value.slice(0, 100),
                          },
                        });
                      }}
                      placeholder="Quốc gia"
                      maxLength={100}
                      className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin vận chuyển */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  Thông tin vận chuyển
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Đơn vị vận chuyển
                    </label>
                    <input
                      value={confirmForm.shippingInfo.carrier}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          shippingInfo: {
                            ...confirmForm.shippingInfo,
                            carrier: e.target.value.slice(0, 100),
                          },
                        });
                      }}
                      placeholder="VD: Viettel Post, EMS..."
                      maxLength={100}
                      className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mã vận đơn
                    </label>
                    <input
                      value={confirmForm.shippingInfo.trackingNumber}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          shippingInfo: {
                            ...confirmForm.shippingInfo,
                            trackingNumber: e.target.value.slice(0, 50),
                          },
                        });
                      }}
                      placeholder="Mã vận đơn"
                      maxLength={50}
                      className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Ngày nhận và Số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ngày nhận
                  </label>
                  <input
                    type="date"
                    value={confirmForm.distributionDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setConfirmForm({
                        ...confirmForm,
                        distributionDate: e.target.value,
                      });
                    }}
                    className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số lượng nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRecord?.quantity || undefined}
                    value={confirmForm.distributedQuantity}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value === "" || value === "-") {
                        setConfirmForm({
                          ...confirmForm,
                          distributedQuantity: value,
                        });
                        return;
                      }
                      const numValue = parseInt(value);
                      if (isNaN(numValue) || numValue <= 0) {
                        value = "1";
                      } else {
                        const maxQuantity = selectedRecord?.quantity || 0;
                        if (maxQuantity > 0 && numValue > maxQuantity) {
                          value = maxQuantity.toString();
                        } else {
                          value = numValue.toString();
                        }
                      }
                      setConfirmForm({
                        ...confirmForm,
                        distributedQuantity: value,
                      });
                    }}
                    className={`w-full h-14 border-2 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:outline-none transition ${
                      confirmFormErrors.distributedQuantity
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 focus:ring-primary focus:border-primary hover:border-slate-400"
                    }`}
                  />
                  {confirmFormErrors.distributedQuantity && (
                    <p className="mt-1 text-xs text-red-600">
                      {confirmFormErrors.distributedQuantity}
                    </p>
                  )}
                  <div className="text-xs text-primary font-medium mt-1">
                    Tối đa: {getQuantityDisplay(selectedRecord)} NFT
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows="3"
                  value={confirmForm.notes}
                  onChange={(e) =>
                    setConfirmForm({
                      ...confirmForm,
                      notes: e.target.value.slice(0, 500),
                    })
                  }
                  maxLength={500}
                  className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition resize-none"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Sau khi xác nhận, thông tin nhận hàng sẽ được lưu vào hệ
                    thống và không thể chỉnh sửa.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 md:px-8 py-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={handleCloseConfirmDialog}
                className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                Hủy
              </button>
              <TruckAnimationButton
                onClick={handleSubmitConfirm}
                disabled={isConfirming}
                buttonState={isConfirming ? "uploading" : "idle"}
                defaultText="Xác nhận hàng"
                uploadingText="Đang xử lý..."
                successText="Hoàn thành"
                animationMode="infinite"
                animationDuration={3}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
