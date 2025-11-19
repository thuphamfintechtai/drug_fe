import { validateForm } from "../constants/validateForm";
import { useCreateProofDialog } from "../hooks/useCreateProofDialog";

const CreateProofDialog = ({
  onClose,
  formData,
  setFormData,
  drugs,
  loading,
  onSubmit,
}) => {
  const { errors, handleInputChange, handleSubmit, setErrors } =
    useCreateProofDialog(formData, setFormData, validationResult, onSubmit);
  const validationResult = validateForm(formData, setErrors);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-slideUp border border-cyan-200">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">🏭</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold !text-white">
                  Tạo chứng nhận sản xuất
                </h2>
                <p className="text-cyan-100 text-sm">
                  Điền thông tin vào form bên dưới
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center !text-white text-xl transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-white">
          {/* Chọn thuốc */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <span className="text-cyan-600 mr-1">📋</span>
              Chọn thuốc <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full border-2 rounded-xl p-3.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                errors.drugId ? "border-red-500" : "border-cyan-300"
              }`}
              value={formData.drugId}
              onChange={(e) => handleInputChange("drugId", e.target.value)}
              required
            >
              <option value="">-- Chọn thuốc --</option>
              {drugs && Array.isArray(drugs) && drugs.length > 0 ? (
                drugs.map((drug) => (
                  <option key={drug._id} value={drug._id}>
                    {drug.tradeName} ({drug.genericName}) - {drug.atcCode}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Không có thuốc nào
                </option>
              )}
            </select>
            {errors.drugId && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <span>⚠️</span> {errors.drugId}
              </p>
            )}
          </div>

          {/* Ngày sản xuất + hết hạn */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="📅 Ngày sản xuất"
              type="date"
              value={formData.mfgDate}
              required
              error={errors.mfgDate}
              onChange={(e) => handleInputChange("mfgDate", e.target.value)}
            />
            <Field
              label="📆 Ngày hết hạn"
              type="date"
              value={formData.expDate}
              required
              error={errors.expDate}
              onChange={(e) => handleInputChange("expDate", e.target.value)}
            />
          </div>

          {/* Quantity + QA Inspector */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="🔢 Số lượng"
              type="number"
              value={formData.quantity}
              required
              error={errors.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
            />
            <Field
              label="👤 Kiểm định viên (Tùy chọn)"
              value={formData.qaInspector || ""}
              onChange={(e) =>
                handleInputChange("qaInspector", e.target.value || null)
              }
              helper="Để trống nếu không bắt buộc"
            />
          </div>

          {/* QA Report URI */}
          <div>
            <Field
              label="📄 Báo cáo QA"
              value={formData.qaReportUri}
              onChange={(e) => handleInputChange("qaReportUri", e.target.value)}
              helper="URL báo cáo kiểm định chất lượng"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-cyan-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 rounded-xl !text-white font-medium transition-all shadow-lg ${
              loading
                ? "bg-cyan-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                Đang tạo...
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <span>✅</span> Tạo chứng nhận
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  helper,
  error,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold text-gray-800 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      required={required}
      className={`w-full border-2 rounded-xl p-3.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
        error ? "border-red-500" : "border-cyan-300"
      }`}
    />
    {error && (
      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
        <span>⚠️</span> {error}
      </p>
    )}
    {helper && !error && (
      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
        <span>💡</span> {helper}
      </p>
    )}
  </div>
);

export default CreateProofDialog;
