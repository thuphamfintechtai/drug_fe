import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { Search } from "../../shared/components/ui/search";
import { navigationItems } from "../constants/navigationDrug";
import { useDrugManagement } from "../hooks/useDrugManagement";

export default function DrugManagement() {
  const {
    drugs,
    allDrugs,
    showDialog,
    isEditMode,
    searchAtc,
    loadingProgress,
    showCustomDosageForm,
    showCustomRoute,
    strengthValue,
    strengthUnit,
    packagingVial,
    packagingPill,
    formData,
    setFormData,
    strengthUnits,
    dosageFormOptions,
    routeOptions,
    combineStrength,
    setDrugs,
    combinePackaging,
    handleSubmit,
    setSearchAtc,
    handleSearch,
    handleCreate,
    handleEdit,
    handleDelete,
    setShowDialog,
    errors,
    loading,
    setStrengthValue,
    setStrengthUnit,
    setShowCustomDosageForm,
    setShowCustomRoute,
    setPackagingVial,
    setPackagingPill,
    setErrors,
    updateDrugMutation,
    addDrugMutation,
  } = useDrugManagement();
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
          <CardUI
            title="Quản lý thuốc"
            subtitle="Thêm, sửa, xóa và tìm kiếm thuốc trong hệ thống"
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
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            }
          />
          {/* Search & Create */}
          <div className="flex items-end gap-3">
            <Search
              searchInput={searchAtc}
              setSearchInput={setSearchAtc}
              handleSearch={handleSearch}
              handleClearSearch={() => {
                setSearchAtc("");
                setDrugs(allDrugs);
              }}
              placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
              enableAutoSearch={true}
              debounceMs={300}
              data={allDrugs}
              getSearchText={(drug) => drug.tradeName || ""}
              matchFunction={(drug, searchLower) => {
                const tradeName = (drug.tradeName || "").toLowerCase();
                const genericName = (drug.genericName || "").toLowerCase();
                const atc = (drug.atcCode || "").toLowerCase();
                return (
                  tradeName.includes(searchLower) ||
                  genericName.includes(searchLower) ||
                  atc.includes(searchLower)
                );
              }}
              getDisplayText={(drug) =>
                `${drug.tradeName} - ${drug.genericName} (${drug.atcCode})`
              }
            />

            <button
              onClick={handleCreate}
              className="px-4 py-2.5 rounded-full bg-secondary !text-white font-medium transition shadow-md hover:shadow-lg h-12"
            >
              Tạo thuốc mới
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden">
            {drugs.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 opacity-60"
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
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto ">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên thương mại
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên hoạt chất
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Mã ATC
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Dạng bào chế
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Hàm lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {drugs.map((drug, index) => (
                      <tr
                        key={drug.id || drug._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {drug.tradeName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.genericName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {drug.atcCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.dosageForm || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.strength || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 w-24 justify-center rounded-full text-xs font-semibold ${
                              drug.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
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
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
        .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold !text-white">
                  {isEditMode ? "Cập nhật thuốc" : "Tạo thuốc mới"}
                </h2>
                <p className="text-gray-100 text-sm">
                  Vui lòng nhập thông tin thuốc bên dưới
                </p>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-4 max-h-[500px] overflow-auto hide-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Tên thương mại"
                  placeholder="VD: Vitamin A, ..."
                  value={formData.tradeName}
                  onChange={(v) => {
                    setFormData({ ...formData, tradeName: v });
                    if (errors.tradeName) {
                      setErrors({ ...errors, tradeName: "" });
                    }
                  }}
                  error={errors.tradeName}
                />
                <InputField
                  label="Tên hoạt chất"
                  placeholder="VD: Khoáng chất a, ..."
                  value={formData.genericName}
                  onChange={(v) => {
                    setFormData({ ...formData, genericName: v });
                    if (errors.genericName) {
                      setErrors({ ...errors, genericName: "" });
                    }
                  }}
                  error={errors.genericName}
                />

                {/* Row 2: Mã ATC, Hàm lượng */}
                <InputField
                  label="Mã ATC"
                  placeholder="VD: N1A65E03, ..."
                  value={formData.atcCode}
                  onChange={(v) => {
                    // Chỉ cho phép chữ và số, tự động chuyển sang UPPERCASE
                    const value = v.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                    setFormData({ ...formData, atcCode: value });
                    if (errors.atcCode) {
                      setErrors({ ...errors, atcCode: "" });
                    }
                  }}
                  error={errors.atcCode}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hàm lượng
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={strengthValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setStrengthValue(value);
                          // Tự động update formData.strength khi value thay đổi
                          const strength = combineStrength(value, strengthUnit);
                          setFormData({ ...formData, strength: strength });
                          if (errors.strength) {
                            setErrors({ ...errors, strength: "" });
                          }
                        }}
                        placeholder="VD: 500"
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          errors.strength
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <select
                        value={strengthUnit}
                        onChange={(e) => {
                          const unit = e.target.value;
                          setStrengthUnit(unit);
                          // Tự động update formData.strength khi unit thay đổi
                          const strength = combineStrength(strengthValue, unit);
                          setFormData({ ...formData, strength: strength });
                        }}
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150 bg-white"
                      >
                        {strengthUnits.map((unit, index) => (
                          <option key={index} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 3: Dạng bào chế, Đường dùng */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dạng bào chế
                  </label>
                  <select
                    value={
                      showCustomDosageForm
                        ? "Khác"
                        : dosageFormOptions.includes(formData.dosageForm)
                        ? formData.dosageForm
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Khác") {
                        // Khi chọn "Khác", hiển thị input field và set giá trị rỗng nếu chưa có giá trị tùy chỉnh
                        setShowCustomDosageForm(true);
                        if (!dosageFormOptions.includes(formData.dosageForm)) {
                          // Giữ nguyên giá trị tùy chỉnh
                        } else {
                          // Set rỗng để người dùng nhập
                          setFormData({ ...formData, dosageForm: "" });
                        }
                      } else if (v) {
                        // Khi chọn option khác, ẩn input field và set giá trị là option đó
                        setShowCustomDosageForm(false);
                        setFormData({ ...formData, dosageForm: v });
                      } else {
                        // Khi chọn rỗng
                        setShowCustomDosageForm(false);
                        setFormData({ ...formData, dosageForm: "" });
                      }
                      if (errors.dosageForm) {
                        setErrors({ ...errors, dosageForm: "" });
                      }
                    }}
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 bg-white ${
                      errors.dosageForm
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <option value="">Chọn dạng bào chế</option>
                    {dosageFormOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cách dùng
                  </label>
                  <select
                    value={
                      showCustomRoute
                        ? "Khác"
                        : routeOptions.includes(formData.route)
                        ? formData.route
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Khác") {
                        // Khi chọn "Khác", hiển thị input field và set giá trị rỗng nếu chưa có giá trị tùy chỉnh
                        setShowCustomRoute(true);
                        if (!routeOptions.includes(formData.route)) {
                          // Giữ nguyên giá trị tùy chỉnh
                        } else {
                          // Set rỗng để người dùng nhập
                          setFormData({ ...formData, route: "" });
                        }
                      } else if (v) {
                        // Khi chọn option khác, ẩn input field và set giá trị là option đó
                        setShowCustomRoute(false);
                        setFormData({ ...formData, route: v });
                      } else {
                        // Khi chọn rỗng
                        setShowCustomRoute(false);
                        setFormData({ ...formData, route: "" });
                      }
                      if (errors.route) {
                        setErrors({ ...errors, route: "" });
                      }
                    }}
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 bg-white ${
                      errors.route
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <option value="">Chọn đường dùng</option>
                    {routeOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 4: Input tùy chỉnh cho Dạng bào chế và Đường dùng - chỉ hiện khi chọn "Khác" */}
                {(showCustomDosageForm || showCustomRoute) && (
                  <>
                    {showCustomDosageForm ? (
                      <InputField
                        label="Nhập dạng bào chế"
                        placeholder="VD: Viên nén bao đường, ..."
                        value={formData.dosageForm || ""}
                        onChange={(v) => {
                          setFormData({ ...formData, dosageForm: v });
                          if (errors.dosageForm) {
                            setErrors({ ...errors, dosageForm: "" });
                          }
                        }}
                        error={errors.dosageForm}
                      />
                    ) : (
                      <div></div>
                    )}
                    {showCustomRoute ? (
                      <InputField
                        label="Nhập đường dùng"
                        placeholder="VD: Uống với nước, ..."
                        value={formData.route || ""}
                        onChange={(v) => {
                          setFormData({ ...formData, route: v });
                          if (errors.route) {
                            setErrors({ ...errors, route: "" });
                          }
                        }}
                        error={errors.route}
                      />
                    ) : (
                      <div></div>
                    )}
                  </>
                )}

                {/* Row 5: Quy cách đóng gói, Bảo quản */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quy cách đóng gói
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={packagingVial}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPackagingVial(value);
                          // Tự động update formData.packaging khi value thay đổi
                          const packaging = combinePackaging(
                            value,
                            packagingPill
                          );
                          setFormData({ ...formData, packaging });
                        }}
                        placeholder="VD: 10"
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                      />
                      <div className="text-xs text-gray-500 mt-1">Số vỉ</div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={packagingPill}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPackagingPill(value);
                          // Tự động update formData.packaging khi value thay đổi
                          const packaging = combinePackaging(
                            packagingVial,
                            value
                          );
                          setFormData({ ...formData, packaging });
                        }}
                        placeholder="VD: 10"
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                      />
                      <div className="text-xs text-gray-500 mt-1">Số viên</div>
                    </div>
                  </div>
                  {packagingVial || packagingPill ? (
                    <div className="text-xs text-cyan-600 mt-2 font-medium">
                      Kết quả: {combinePackaging(packagingVial, packagingPill)}
                    </div>
                  ) : null}
                </div>
                <InputField
                  label="Bảo quản"
                  placeholder="VD: Để nơi khô ráo, ..."
                  value={formData.storage}
                  onChange={(v) => {
                    setFormData({ ...formData, storage: v });
                    if (errors.storage) {
                      setErrors({ ...errors, storage: "" });
                    }
                  }}
                  error={errors.storage}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <hr className="flex-1 border-gray-300" />
                <span className="text-gray-500 text-sm">Tùy chọn</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cảnh báo
                </label>
                <textarea
                  value={formData.warnings}
                  onChange={(e) =>
                    setFormData({ ...formData, warnings: e.target.value })
                  }
                  rows="3"
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  placeholder="VD: Không dùng cho trẻ em dưới 2 tuổi ..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-300 bg-gray-50 rounded-b-3xl flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={
                  addDrugMutation.isPending || updateDrugMutation.isPending
                }
                className="px-6 py-2.5 rounded-full bg-primary !text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200"
              >
                {addDrugMutation.isPending || updateDrugMutation.isPending
                  ? "Đang lưu..."
                  : isEditMode
                  ? "Cập nhật"
                  : "Tạo thuốc"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InputField({ label, placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
        }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150 bg-white"
      >
        <option value="">{placeholder || "Chọn..."}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
