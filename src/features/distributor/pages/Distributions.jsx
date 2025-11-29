import { useCallback } from "react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useDistributions } from "../hooks/useDistributions.jsx";
import { Spin, Table } from "antd";
import { Search } from "../../shared/components/ui/search";
import { CardUI } from "../../shared/components/ui/cardUI";

export default function Distributions() {
  const {
    loading,
    filteredData,
    searchText,
    setSearchText,
    columns,
    data,
    showConfirmDialog,
    selectedRecord,
    isConfirming,
    confirmForm,
    setConfirmForm,
    confirmFormErrors,
    handleCloseConfirmDialog,
    handleSubmitConfirm,
  } = useDistributions();

  const handleSearch = useCallback((searchValue = null) => {
    const term = (searchValue !== null ? searchValue : searchText)
      .trim()
      .toLowerCase();
    setSearchText(term);
  }, [searchText, setSearchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, [setSearchText]);

  const getSearchText = useCallback((item) => {
    const drug =
      item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
    const drugName =
      drug?.name || drug?.tradeName || item.drugName || "";
    return (
      item.invoiceNumber ||
      item.code ||
      drugName ||
      item.verificationCode ||
      ""
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
    const verificationCode = (
      item.verificationCode || ""
    ).toLowerCase();
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
    const verificationCode = (
      item.verificationCode || ""
    ).toLowerCase();
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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <CardUI
        title="Đơn hàng nhận từ Nhà sản xuất"
        subtitle="Quản lý và xác nhận các đơn hàng nhận từ nhà sản xuất dược phẩm"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#00a3c4]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <Search
            searchInput={searchText}
            setSearchInput={setSearchText}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder="Tìm kiếm theo mã đơn, tên thuốc, mã xác minh..."
            data={data}
            getSearchText={getSearchText}
            matchFunction={matchFunction}
            getDisplayText={getDisplayText}
            enableAutoSearch={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record._id || record.id}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </div>

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
              .custom-scroll { scrollbar-width: thin; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 6px; }
              .custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
              .custom-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
              .custom-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold !text-white">
                  Xác nhận nhận hàng
                </h2>
                <p className="text-gray-100 text-sm">
                  Đơn: {selectedRecord.invoiceNumber || selectedRecord.code || "N/A"}
                </p>
              </div>
              <button
                onClick={handleCloseConfirmDialog}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Người nhận */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Người nhận hàng
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
                      if (confirmFormErrors.receivedBy) {
                        setConfirmFormErrors({
                          ...confirmFormErrors,
                          receivedBy: "",
                        });
                      }
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
                  <p className="mt-1 text-xs text-red-600">{confirmFormErrors.receivedBy}</p>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chức vụ (tuỳ chọn)
                  </label>
                  <input
                    value={confirmForm.receivedByTitle}
                    onChange={(e) =>
                      setConfirmForm({
                        ...confirmForm,
                        receivedByTitle: e.target.value.replace(/[^a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]/g, "").slice(0, 50),
                      })
                    }
                    placeholder="VD: Kho vận"
                    maxLength={50}
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150"
                  />
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa chỉ giao hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        if (confirmFormErrors.deliveryAddressStreet) {
                          setConfirmFormErrors({
                            ...confirmFormErrors,
                            deliveryAddressStreet: "",
                          });
                        }
                      }}
                      placeholder="Số nhà, đường..."
                      maxLength={200}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        confirmFormErrors.deliveryAddressStreet
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressStreet && (
                      <p className="mt-1 text-xs text-red-600">{confirmFormErrors.deliveryAddressStreet}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        if (confirmFormErrors.deliveryAddressCity) {
                          setConfirmFormErrors({
                            ...confirmFormErrors,
                            deliveryAddressCity: "",
                          });
                        }
                      }}
                      placeholder="TP/Huyện"
                      maxLength={100}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        confirmFormErrors.deliveryAddressCity
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    {confirmFormErrors.deliveryAddressCity && (
                      <p className="mt-1 text-xs text-red-600">{confirmFormErrors.deliveryAddressCity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <input
                      value={confirmForm.deliveryAddress.state}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          deliveryAddress: {
                            ...confirmForm.deliveryAddress,
                            state: e.target.value.slice(0, 100),
                          },
                        });
                      }}
                      placeholder="Tỉnh/Thành phố"
                      maxLength={100}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã bưu điện
                    </label>
                    <input
                      value={confirmForm.deliveryAddress.postalCode}
                      onChange={(e) => {
                        setConfirmForm({
                          ...confirmForm,
                          deliveryAddress: {
                            ...confirmForm.deliveryAddress,
                            postalCode: e.target.value.slice(0, 10),
                          },
                        });
                      }}
                      placeholder="Mã bưu điện"
                      maxLength={10}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400"
                    />
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin vận chuyển */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin vận chuyển</h3>
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400"
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
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400"
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
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 focus:ring-gray-400 hover:border-gray-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      // Error sẽ được clear trong hook
                    }}
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                      confirmFormErrors.distributedQuantity
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  />
                  {confirmFormErrors.distributedQuantity && (
                    <p className="mt-1 text-xs text-red-600">{confirmFormErrors.distributedQuantity}</p>
                  )}
                  {selectedRecord?.quantity && (
                    <p className="mt-2 text-sm text-blue-500">
                      (Tối đa: {selectedRecord.quantity} - số lượng đã được gửi đến)
                    </p>
                  )}
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
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150 focus:ring-gray-400"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-300 bg-gray-50 rounded-b-3xl flex justify-end gap-3">
              <button
                onClick={handleCloseConfirmDialog}
                disabled={isConfirming}
                className="px-5 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitConfirm}
                disabled={isConfirming}
                className="px-6 py-2.5 rounded-full bg-primary !text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isConfirming ? "Đang xử lý..." : "Xác nhận nhận hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
