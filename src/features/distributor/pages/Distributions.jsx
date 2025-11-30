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
          <CardUI
            title="Đơn hàng nhận từ Nhà sản xuất"
            subtitle="Quản lý và xác nhận các đơn hàng nhận từ nhà sản xuất dược phẩm"
            content={{
              title: "Quy trình xác nhận",
              step1: {
                title: "Kiểm tra đơn hàng",
                description:
                  "Xem danh sách các đơn hàng đã được gửi từ manufacturer",
              },
              step2: {
                title: "Xác nhận hàng",
                description:
                  "Nhập thông tin người nhận, địa chỉ giao hàng và số lượng thực nhận",
              },
              step3: {
                title: "Cập nhật trạng thái",
                description:
                  "Hệ thống cập nhật trạng thái đơn hàng và lưu thông tin vào blockchain",
              },
              step4: {
                title: "Sẵn sàng chuyển tiếp",
                description:
                  "Đơn hàng đã xác nhận có thể được chuyển tiếp cho pharmacy",
              },
            }}
          />

          {/* Search */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
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
          </motion.div>

          {/* Table */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">
                Danh sách đơn hàng
              </h2>
            </div>

            {filteredData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-slate-600">
                  Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Từ Manufacturer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Tên thuốc
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Số lượng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Ngày gửi
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
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
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            // Không navigate nếu click vào button
                            if (e.target.closest("button")) {
                              return;
                            }
                            navigate(`/distributor/distributions/${recordId}`);
                          }}
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 max-w-[200px] truncate">
                              {getInvoiceDisplay(record)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#003544]">
                            {getManufacturerDisplay(record)}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {getDrugDisplay(record)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-800">
                              {getQuantityDisplay(record)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">
                              NFT
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-sm">
                            {getDateDisplay(
                              record.createdAt || record.sentDate
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`w-25 flex justify-center text-center items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              {canConfirm ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm && onConfirm(record);
                                  }}
                                  className=" w-35 px-6 py-2 rounded-full font-semibold transition-all duration-200 border-2 border-[#3db6d9] bg-white !text-[#3db6d9] hover:bg-[#3db6d9] hover:!text-white hover:shadow-md hover:shadow-[#3db6d9]/40"
                                >
                                  Xác nhận
                                </button>
                              ) : isConfirmed ? (
                                <span className="w-35 px-4 py-2 rounded-full font-semibold border-2 border-gray-300 text-gray-500 bg-gray-50">
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
            )}
          </motion.div>
        </div>
      )}

      {/* Confirm Receipt Dialog */}
      {showConfirmDialog && selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseConfirmDialog}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold !text-white">
                    Xác nhận hàng
                  </h2>
                  <p className="text-cyan-100 text-sm">
                    Đơn: {getInvoiceDisplay(selectedRecord)}
                  </p>
                </div>
                <button
                  onClick={handleCloseConfirmDialog}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4 relative max-h-[500px] overflow-auto hide-scrollbar">
              {/* Thông tin đơn hàng */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-card-primary">
                <div className="font-bold text-cyan-800 mb-3">
                  Thông tin đơn hàng:
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mã đơn:</span>
                    <span className="font-mono font-medium truncate max-w-[200px]">
                      {getInvoiceDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Từ:</span>
                    <span className="font-medium">
                      {getManufacturerDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tên thuốc:</span>
                    <span className="font-medium">
                      {getDrugDisplay(selectedRecord)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số lượng gửi:</span>
                    <span className="font-bold text-orange-700">
                      {getQuantityDisplay(selectedRecord)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Người nhận */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Người nhận hàng *
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
                  className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                    confirmFormErrors.receivedBy
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                  }`}
                />
                {confirmFormErrors.receivedBy && (
                  <p className="mt-1 text-xs text-red-600">
                    {confirmFormErrors.receivedBy}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                />
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Địa chỉ giao hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Đường/Phố *
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
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition ${
                        confirmFormErrors.deliveryAddressStreet
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressStreet && (
                      <p className="mt-1 text-xs text-red-600">
                        {confirmFormErrors.deliveryAddressStreet}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thành phố *
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
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition ${
                        confirmFormErrors.deliveryAddressCity
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressCity && (
                      <p className="mt-1 text-xs text-red-600">
                        {confirmFormErrors.deliveryAddressCity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin vận chuyển */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Thông tin vận chuyển
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                    />
                  </div>
                </div>
              </div>

              {/* Ngày nhận và Số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng nhận *
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
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition ${
                      confirmFormErrors.distributedQuantity
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  />
                  {confirmFormErrors.distributedQuantity && (
                    <p className="mt-1 text-xs text-red-600">
                      {confirmFormErrors.distributedQuantity}
                    </p>
                  )}
                  <div className="text-xs text-cyan-600 mt-1">
                    Tối đa: {getQuantityDisplay(selectedRecord)} NFT
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  ⚠️ Sau khi xác nhận, thông tin nhận hàng sẽ được lưu vào hệ
                  thống và không thể chỉnh sửa.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
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
