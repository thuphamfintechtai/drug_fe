import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckAnimationButton from "../../shared/components/TruckAnimationButton";
import BlockchainMintingView from "../../shared/components/BlockchainMintingView";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { navigationItems } from "../constants/navigationProductionManagement";
import { useProductionManagement } from "../hooks/useProductionManagement";

export default function ProductionManagement() {
  const {
    drugs,
    loading,

    showDialog,
    loadingProgress,

    handleStartProduction,
    handleClose,
    step,
    formData,
    setFormData,
    errors,
    setErrors,
    selectedDrug,
    validateAndFixManufacturingDate,
    getMaxShelfLife,
    validateShelfLife,
    formatDateMDY,
    setShelfLifeValue,
    setShelfLifeUnit,
    shelfLifeValue,
    shelfLifeUnit,
    ipfsData,
    mintResult,
    mintButtonState,
    processingMint,
    uploadButtonState,
    handleUploadToIPFS,
    handleMintNFT,
  } = useProductionManagement();
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
        <div className="space-y-5">
          {/* Banner */}

          <CardUI
            title="Sản xuất thuốc & Mint NFT"
            subtitle="Tạo lô sản xuất và mint NFT trên blockchain (2 bước: IPFS + Smart Contract)"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#007b91]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
            }
            content={{
              title: "Quy trình sản xuất",
              step1: {
                title: "Nhập thông tin sản xuất",
                description:
                  "Chọn thuốc, số lô, số lượng, ngày sản xuất & hạn sử dụng",
              },
              step2: {
                title: "Upload lên IPFS",
                description: "Lưu metadata lên Pinata IPFS",
              },
              step3: {
                title: "Mint NFT trên Blockchain",
                description: "Gọi Smart Contract để mint NFT",
              },
            }}
          />

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleStartProduction}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-secondary to-primary !text-white font-medium shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              Bắt đầu sản xuất mới
            </button>
          </div>
        </div>
      )}

      {/* Production Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <style>{`
              /* Ẩn scrollbar trong modal để giao diện sạch hơn */
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>

            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold !text-white">
                    Sản xuất & Mint NFT
                  </h2>
                  <p className="text-cyan-100 text-sm">
                    {step === 1 && "Bước 1/2: Nhập thông tin sản xuất"}
                    {step === 2 && "Bước 2/2: Sẵn sàng mint NFT"}
                    {step === 3 && "Đang mint NFT..."}
                    {step === 4 && "Hoàn thành!"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === 3}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scroll bg-white" style={{ minHeight: '400px' }}>
              {/* Step 1: Form */}
              {step === 1 ? (
                <div className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chọn thuốc *
                  </label>
                  <select
                    value={formData.drugId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedOption = e.target.options[e.target.selectedIndex];
                      
                      console.log("🔍 Drug selected:", {
                        selectedId,
                        selectedIdType: typeof selectedId,
                        isMongoId: /^[0-9a-fA-F]{24}$/.test(selectedId),
                        selectedOptionValue: selectedOption?.value,
                        selectedOptionText: selectedOption?.text,
                        allOptions: Array.from(e.target.options).map(opt => ({
                          value: opt.value,
                          text: opt.text,
                          isMongoId: /^[0-9a-fA-F]{24}$/.test(opt.value)
                        }))
                      });
                      
                      // Validate: chỉ set nếu là MongoDB ObjectId hợp lệ hoặc empty string
                      if (selectedId === "" || /^[0-9a-fA-F]{24}$/.test(selectedId)) {
                        setFormData({ ...formData, drugId: selectedId });
                        if (errors.drugId) {
                          setErrors({ ...errors, drugId: "" });
                        }
                      } else {
                        console.error("❌ Invalid drugId selected:", selectedId);
                        toast.error("Lỗi: Vui lòng chọn lại thuốc", {
                          position: "top-right",
                        });
                      }
                    }}
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                      errors.drugId
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <option value="">-- Chọn thuốc --</option>
                    {drugs.map((drug) => {
                      // Đảm bảo có _id hoặc id hợp lệ
                      const drugId = drug._id || drug.id;
                      if (!drugId) {
                        console.warn("⚠️ Drug missing _id:", drug);
                        return null;
                      }
                      return (
                        <option key={drugId} value={drugId}>
                          {drug.tradeName} ({drug.atcCode})
                        </option>
                      );
                    })}
                  </select>
                  {errors.drugId && (
                    <p className="mt-1 text-sm text-red-600">{errors.drugId}</p>
                  )}
                </div>

                {selectedDrug && (
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <div className="text-sm font-semibold text-cyan-800 mb-2">
                      Thông tin thuốc:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Tên hoạt chất:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.genericName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Dạng bào chế:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.dosageForm}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Hàm lượng:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.strength}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Quy cách:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.packaging}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lô sản xuất *
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      maxLength={30}
                      onChange={(e) => {
                        // Chỉ cho phép chữ và số, tự động chuyển sang uppercase, giới hạn 30 ký tự
                        let value = e.target.value
                          .replace(/[^A-Za-z0-9]/g, "")
                          .toUpperCase();

                        // Giới hạn tối đa 30 ký tự
                        if (value.length > 30) {
                          value = value.substring(0, 30);
                        }

                        setFormData({
                          ...formData,
                          batchNumber: value,
                        });
                        // Clear error khi người dùng nhập
                        if (errors.batchNumber) {
                          setErrors({ ...errors, batchNumber: "" });
                        }
                      }}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.batchNumber
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                      placeholder="VD: LOT2024001"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.batchNumber.length}/30 ký tự
                    </div>
                    {errors.batchNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.batchNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng (hộp) *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Cho phép rỗng để người dùng có thể xóa
                        if (value === "") {
                          setFormData({ ...formData, quantity: value });
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: "" });
                          }
                          return;
                        }

                        // Loại bỏ dấu trừ và các ký tự không phải số
                        value = value.replace(/[^0-9]/g, "");

                        if (value === "") {
                          setFormData({ ...formData, quantity: "" });
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: "" });
                          }
                          return;
                        }

                        const numValue = parseInt(value);

                        // Kiểm tra giới hạn tối đa
                        if (numValue >= 10000000) {
                          value = "9999999";
                        }

                        setFormData({ ...formData, quantity: value });

                        // Clear error khi người dùng nhập
                        if (errors.quantity) {
                          setErrors({ ...errors, quantity: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        // Ngăn chặn nhập dấu trừ, dấu cộng, chữ e, E, dấu chấm
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "."
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.quantity
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                      placeholder="VD: 1000"
                      min="1"
                      max="9999999"
                    />
                    <div className="text-xs text-cyan-600 mt-1">
                      Sẽ mint {formData.quantity || 0} NFT (1 NFT = 1 hộp thuốc)
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày sản xuất *
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;

                        if (!selectedDate) {
                          setFormData({
                            ...formData,
                            manufacturingDate: selectedDate,
                          });
                          if (errors.manufacturingDate) {
                            setErrors({ ...errors, manufacturingDate: "" });
                          }
                          return;
                        }

                        // Kiểm tra và sửa ngày nếu không hợp lệ
                        const validationResult =
                          validateAndFixManufacturingDate(selectedDate);

                        setFormData({
                          ...formData,
                          manufacturingDate: validationResult.fixedDate,
                        });

                        // Clear error khi người dùng chọn ngày
                        if (errors.manufacturingDate) {
                          setErrors({ ...errors, manufacturingDate: "" });
                        }
                      }}
                      onBlur={(e) => {
                        const selectedDate = e.target.value;
                        if (!selectedDate) {
                          return;
                        }

                        // Kiểm tra lại khi blur và tự động sửa nếu không hợp lệ
                        const validationResult =
                          validateAndFixManufacturingDate(selectedDate);

                        if (!validationResult.isValid) {
                          setFormData({
                            ...formData,
                            manufacturingDate: validationResult.fixedDate,
                          });
                        }
                      }}
                      min={(() => {
                        const today = new Date();
                        const minDate = new Date(today);
                        minDate.setDate(today.getDate() - 60);
                        return minDate.toISOString().split("T")[0];
                      })()}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.manufacturingDate
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Phạm vi: Từ 60 ngày trước đến hôm nay
                    </div>
                    {errors.manufacturingDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.manufacturingDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời hạn sử dụng *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        max={getMaxShelfLife(shelfLifeUnit)}
                        value={shelfLifeValue}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Cho phép rỗng để người dùng có thể xóa
                          if (value === "") {
                            setShelfLifeValue(value);
                            if (errors.shelfLife) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                            return;
                          }

                          // Loại bỏ ký tự không phải số và dấu chấm
                          value = value.replace(/[^0-9.]/g, "");

                          // Chỉ cho phép một dấu chấm
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts.slice(1).join("");
                          }

                          const numValue = parseFloat(value);
                          const maxValue = getMaxShelfLife(shelfLifeUnit);

                          // Kiểm tra giới hạn tối đa
                          if (!isNaN(numValue) && numValue > maxValue) {
                            value = maxValue.toString();
                          }

                          setShelfLifeValue(value);

                          // Validate realtime
                          if (value) {
                            const validation = validateShelfLife(
                              value,
                              shelfLifeUnit,
                              formData.manufacturingDate
                            );
                            if (!validation.isValid) {
                              setErrors({
                                ...errors,
                                shelfLife: validation.error,
                              });
                            } else {
                              // Clear error khi hợp lệ
                              if (errors.shelfLife) {
                                setErrors({ ...errors, shelfLife: "" });
                              }
                            }
                          } else {
                            // Clear error khi rỗng (để người dùng có thể xóa)
                            if (
                              errors.shelfLife &&
                              errors.shelfLife !==
                                "Thời hạn sử dụng không được để trống"
                            ) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (!value || !value.trim()) {
                            // Không làm gì khi blur nếu rỗng, để validation form xử lý
                            return;
                          }

                          // Validate khi blur
                          const validation = validateShelfLife(
                            value,
                            shelfLifeUnit,
                            formData.manufacturingDate
                          );
                          if (!validation.isValid) {
                            setErrors({
                              ...errors,
                              shelfLife: validation.error,
                            });
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          errors.shelfLife
                            ? "border-red-500 focus:ring-red-400"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                        placeholder="VD: 12"
                      />
                      <select
                        value={shelfLifeUnit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          setShelfLifeUnit(newUnit);

                          // Kiểm tra lại giá trị với đơn vị mới
                          if (shelfLifeValue) {
                            const maxValue = getMaxShelfLife(newUnit);
                            const numValue = parseFloat(shelfLifeValue);

                            // Nếu giá trị vượt quá giới hạn mới, tự động điều chỉnh
                            if (!isNaN(numValue) && numValue > maxValue) {
                              setShelfLifeValue(maxValue.toString());
                            }

                            // Validate lại
                            const validation = validateShelfLife(
                              numValue > maxValue
                                ? maxValue.toString()
                                : shelfLifeValue,
                              newUnit,
                              formData.manufacturingDate
                            );
                            if (!validation.isValid) {
                              setErrors({
                                ...errors,
                                shelfLife: validation.error,
                              });
                            } else {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          } else {
                            // Clear error khi chọn đơn vị mới
                            if (errors.shelfLife) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          }
                        }}
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                      >
                        <option value="day">ngày</option>
                        <option value="month">tháng</option>
                        <option value="year">năm</option>
                      </select>
                    </div>
                    <div className="mt-2 text-cyan-600 text-sm font-medium">
                      Ngày hết hạn:{" "}
                      {formatDateMDY(formData.expiryDate) || "mm/dd/yyyy"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Giới hạn tối đa: {getMaxShelfLife(shelfLifeUnit)}{" "}
                      {shelfLifeUnit === "year"
                        ? "năm"
                        : shelfLifeUnit === "month"
                        ? "tháng"
                        : "ngày"}{" "}
                      (10 năm)
                    </div>
                    {errors.shelfLife && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.shelfLife}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                    rows="3"
                    placeholder="Ghi chú thêm về lô sản xuất..."
                  />
                </div>
              </div>
              ) : null}

            {/* Step 2: IPFS Success */}
            {step === 2 && ipfsData && (
              <div className="p-8 space-y-4">
                {/* Box: Bước 1 hoàn thành */}
                <div className="rounded-xl p-5 border border-cyan-200 bg-cyan-50">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-cyan-600 border border-cyan-200 shadow-sm flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-cyan-800">
                        Bước 1 hoàn thành!
                      </div>
                      <div className="text-sm text-cyan-700">
                        Dữ liệu đã được lưu lên IPFS thành công.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">IPFS Hash:</span>
                      <span className="font-mono text-cyan-700">
                        {ipfsData.ipfsHash}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng NFT:</span>
                      <span className="font-bold text-cyan-800">
                        {ipfsData.amount || formData.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box: Thông tin sản xuất */}
                <div className="rounded-xl p-5 border border-cyan-200 bg-cyan-50">
                  <div className="font-semibold text-cyan-800 mb-3">
                    Thông tin sản xuất:
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thuốc:</span>
                      <span className="font-medium">
                        {selectedDrug?.tradeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lô:</span>
                      <span className="font-mono font-medium">
                        {formData.batchNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-bold text-slate-800">
                        {formData.quantity} hộp
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">NSX:</span>
                      <span className="font-medium">
                        {formData.manufacturingDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">HSD:</span>
                      <span className="font-medium">{formData.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Box: Cảnh báo */}
                <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber-600 border border-amber-200 shadow-sm flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.594A1.999 1.999 0 0116.518 18H3.482a2 2 0 01-1.743-3.307L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-amber-800">
                        Sẵn sàng mint NFT
                      </div>
                      <div className="text-sm text-amber-700">
                        Bước tiếp theo sẽ gọi smart contract để mint{" "}
                        {formData.quantity} NFT lên blockchain. Quá trình này
                        không thể hoàn tác.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Minting */}
            {step === 3 && (
              <div className="p-6">
                <BlockchainMintingView
                  status={
                    mintButtonState === "completed" ? "completed" : "minting"
                  }
                />
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && mintResult && (
              <div className="p-8">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-8 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white border border-cyan-200 text-cyan-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-cyan-900">
                    Sản xuất thành công!
                  </div>
                  <div className="text-sm text-cyan-700 mt-1">
                    NFT đã được mint và lưu vào hệ thống
                  </div>

                  <div className="mt-6 text-left bg-white rounded-xl border border-cyan-100 p-5">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-slate-600">Số lô:</div>
                      <div className="text-right font-mono font-medium">
                        {formData.batchNumber}
                      </div>
                      <div className="text-slate-600">Số lượng NFT:</div>
                      <div className="text-right font-bold text-cyan-800">
                        {formData.quantity}
                      </div>
                      {mintResult.transactionHash && (
                        <>
                          <div className="text-slate-600">
                            Transaction Hash:
                          </div>
                          <div className="text-right font-mono text-xs text-cyan-700">
                            {mintResult.transactionHash.slice(0, 10)}...
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Footer Actions - Fixed */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-8 flex-shrink-0">
              {step === 1 && (
                <TruckAnimationButton
                  onClick={handleUploadToIPFS}
                  disabled={uploadButtonState === "uploading"}
                  buttonState={uploadButtonState}
                  defaultText="Bước 1: Upload IPFS"
                  uploadingText="Đang vận chuyển dữ liệu..."
                  successText="Upload thành công"
                />
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={handleMintNFT}
                    disabled={processingMint}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white font-medium shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {mintButtonState === "minting"
                      ? "Đang mint..."
                      : mintButtonState === "completed"
                      ? "Mint thành công!"
                      : "Mint NFT ngay"}
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white font-medium shadow-md hover:shadow-lg transition"
                  >
                    Hoàn thành
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
