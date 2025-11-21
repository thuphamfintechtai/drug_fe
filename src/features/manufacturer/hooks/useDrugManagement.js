/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";
import { toast } from "sonner";
import useAuthStore from "../../auth/store/useAuthStore";

export const useDrugManagement = () => {
  const { user } = useAuthStore();
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]); // lưu toàn bộ để lọc client
  const [showDialog, setShowDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchAtc, setSearchAtc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [showCustomDosageForm, setShowCustomDosageForm] = useState(false);
  const [showCustomRoute, setShowCustomRoute] = useState(false);
  const [strengthValue, setStrengthValue] = useState("");
  const [strengthUnit, setStrengthUnit] = useState("mg");
  const [packagingVial, setPackagingVial] = useState("");
  const [packagingPill, setPackagingPill] = useState("");
  const [errors, setErrors] = useState({});

  // React Query hooks
  const {
    data: drugsData,
    isLoading: loading,
    error: drugsError,
  } = manufacturerAPIs.getDrugs();

  const addDrugMutation = manufacturerAPIs.addDrug();
  const updateDrugMutation = manufacturerAPIs.updateDrug();
  const deleteDrugMutation = manufacturerAPIs.deleteDrug();

  const [formData, setFormData] = useState({
    tradeName: "",
    genericName: "",
    atcCode: "",
    dosageForm: "",
    strength: "",
    route: "",
    packaging: "",
    storage: "",
    warnings: "",
    activeIngredients: [],
  });

  // Danh sách các dạng bào chế phổ biến
  const dosageFormOptions = [
    "Viên nén",
    "Viên nang",
    "Viên sủi",
    "Viên bao phim",
    "Viên nhai",
    "Viên đặt",
    "Sirô",
    "Hỗn dịch",
    "Dung dịch",
    "Kem",
    "Thuốc mỡ",
    "Gel",
    "Bột",
    "Thuốc nhỏ mắt",
    "Thuốc nhỏ mũi",
    "Thuốc xịt",
    "Dạng lỏng",
    "Dạng bột",
    "Dạng kem bôi",
    "Khác",
  ];

  // Danh sách các đơn vị hàm lượng
  const strengthUnits = [
    "mg",
    "g",
    "ml",
    "l",
    "IU",
    "mcg",
    "µg",
    "%",
    "mEq",
    "unit",
  ];

  // Danh sách các đường dùng phổ biến
  const routeOptions = [
    "Uống",
    "Tiêm",
    "Tiêm bắp",
    "Tiêm tĩnh mạch",
    "Tiêm dưới da",
    "Bôi ngoài da",
    "Nhỏ mắt",
    "Nhỏ mũi",
    "Nhỏ tai",
    "Đặt",
    "Xịt",
    "Hít",
    "Ngậm",
    "Súc miệng",
    "Thụt",
    "Khác",
  ];

  // Hàm để parse strength từ chuỗi (ví dụ: "500mg" -> {value: "500", unit: "mg"})
  const parseStrength = (strengthStr) => {
    if (!strengthStr || !strengthStr.trim()) {
      return { value: "", unit: "mg" };
    }

    // Tìm đơn vị trong chuỗi
    for (const unit of strengthUnits) {
      if (strengthStr.toLowerCase().endsWith(unit.toLowerCase())) {
        const value = strengthStr
          .slice(0, -unit.length)
          .trim()
          .replace(/[^\d.,]/g, "");
        return { value, unit };
      }
    }

    // Nếu không tìm thấy đơn vị, thử tách số và chữ
    const match = strengthStr.match(/^([\d.,]+)\s*(.*)$/);
    if (match) {
      return {
        value: match[1].replace(/[^\d.,]/g, ""),
        unit: match[2].trim() || "mg",
      };
    }

    // Nếu chỉ có số, mặc định đơn vị là mg
    const numMatch = strengthStr.match(/[\d.,]+/);
    if (numMatch) {
      return { value: numMatch[0], unit: "mg" };
    }

    return { value: strengthStr, unit: "mg" };
  };

  // Hàm để combine value và unit thành chuỗi
  const combineStrength = (value, unit) => {
    if (!value || !value.trim()) {
      return "";
    }
    return `${value.trim()}${unit}`;
  };

  // Hàm để parse packaging từ chuỗi (ví dụ: "Hộp 10 vỉ x 10 viên" -> {vial: "10", pill: "10"})
  const parsePackaging = (packagingStr) => {
    if (!packagingStr || !packagingStr.trim()) {
      return { vial: "", pill: "" };
    }

    // Tìm số vỉ và số viên
    const vialMatch = packagingStr.match(/(\d+)\s*vỉ/i);
    const pillMatch = packagingStr.match(/(\d+)\s*viên/i);

    return {
      vial: vialMatch ? vialMatch[1] : "",
      pill: pillMatch ? pillMatch[1] : "",
    };
  };

  // Hàm để combine vial và pill thành chuỗi
  const combinePackaging = (vial, pill) => {
    if (!vial && !pill) {
      return "";
    }

    if (vial && pill) {
      return `Hộp ${vial} vỉ x ${pill} viên`;
    } else if (vial) {
      return `${vial} vỉ`;
    } else if (pill) {
      return `${pill} viên`;
    }

    return "";
  };

  useEffect(() => {
    if (drugsData?.success && drugsData?.data) {
      const list = drugsData.data.drugs || drugsData.data || [];
      setDrugs(list);
      setAllDrugs(list);
    } else if (drugsError) {
      toast.error("Không thể tải danh sách thuốc", {
        position: "top-right",
      });
    }
  }, [drugsData, drugsError]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleSearch = async (searchTerm = null) => {
    const term = (searchTerm || searchAtc).trim().toLowerCase();
    if (!term) {
      setDrugs(allDrugs);
      return;
    }
    // Lọc client theo Tên thương mại, Tên hoạt chất, Mã ATC
    const filtered = (allDrugs || []).filter((d) => {
      const tradeName = (d.tradeName || "").toLowerCase();
      const genericName = (d.genericName || "").toLowerCase();
      const atc = (d.atcCode || "").toLowerCase();
      return tradeName.includes(term) || genericName.includes(term) || atc.includes(term);
    });
    setDrugs(filtered);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedDrug(null);
    resetForm();
    setShowCustomDosageForm(false);
    setShowCustomRoute(false);
    setErrors({});
    setShowDialog(true);
  };

  const handleEdit = (drug) => {
    setIsEditMode(true);
    setSelectedDrug(drug);
    const dosageForm = drug.dosageForm || "";
    const strength = drug.strength || "";
    const packaging = drug.packaging || "";

    // Parse strength thành value và unit
    const { value, unit } = parseStrength(strength);
    setStrengthValue(value);
    setStrengthUnit(unit);

    // Parse packaging thành vial và pill
    const { vial, pill } = parsePackaging(packaging);
    setPackagingVial(vial);
    setPackagingPill(pill);

    const route = drug.route || "";
    setFormData({
      tradeName: drug.tradeName || "",
      genericName: drug.genericName || "",
      atcCode: drug.atcCode || "",
      dosageForm: dosageForm,
      strength: strength,
      route: route,
      packaging: packaging,
      storage: drug.storage || "",
      warnings: drug.warnings || "",
      activeIngredients: drug.activeIngredients || [],
    });
    // Nếu giá trị không có trong options, hiển thị input field tùy chỉnh
    setShowCustomDosageForm(
      dosageForm && !dosageFormOptions.includes(dosageForm)
    );
    setShowCustomRoute(route && !routeOptions.includes(route));
    setErrors({});
    setShowDialog(true);
  };

  const handleDelete = async (drugId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thuốc này?")) {
      return;
    }

    try {
      await deleteDrugMutation.mutateAsync(drugId);
      // Query sẽ tự động invalidate trong hook
    } catch (error) {
      // Error đã được xử lý trong hook
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Tên thương mại
    if (!formData.tradeName || !formData.tradeName.trim()) {
      newErrors.tradeName = "Tên thương mại không được để trống";
    }

    // Validate Tên hoạt chất
    if (!formData.genericName || !formData.genericName.trim()) {
      newErrors.genericName = "Tên hoạt chất không được để trống";
    }

    // Validate Mã ATC
    if (!formData.atcCode || !formData.atcCode.trim()) {
      newErrors.atcCode = "Mã ATC không được để trống";
    }

    // Validate Dạng bào chế
    if (!formData.dosageForm || !formData.dosageForm.trim()) {
      newErrors.dosageForm = "Dạng bào chế không được để trống";
    }

    // Validate Hàm lượng
    if (!strengthValue || !strengthValue.trim()) {
      newErrors.strength = "Hàm lượng không được để trống";
    }

    // Validate Đường dùng
    if (!formData.route || !formData.route.trim()) {
      newErrors.route = "Cách dùng không được để trống";
    }

    // Validate Bảo quản
    if (!formData.storage || !formData.storage.trim()) {
      newErrors.storage = "Bảo quản không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (addDrugMutation.isPending || updateDrugMutation.isPending) {
      return; // Prevent double submission
    }

    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc", {
        position: "top-right",
      });
      return;
    }

    try {
      // Combine strength value và unit trước khi submit
      const strength = combineStrength(strengthValue, strengthUnit);
      // Combine packaging vial và pill trước khi submit
      const packaging = combinePackaging(packagingVial, packagingPill);
      
      // Submit data với field names đúng với backend
      const submitData = {
        tradeName: formData.tradeName,
        genericName: formData.genericName,
        atcCode: formData.atcCode,
        dosageForm: formData.dosageForm,
        strength: strength,
        route: formData.route,
        packaging: packaging,
        storage: formData.storage,
        warnings: formData.warnings,
        activeIngredients: formData.activeIngredients || [],
      };

      if (isEditMode && selectedDrug) {
        await updateDrugMutation.mutateAsync({
          drugId: selectedDrug.id || selectedDrug._id,
          data: submitData,
        });
      } else {
        await addDrugMutation.mutateAsync(submitData);
      }

      // Query sẽ tự động invalidate trong hook
      setShowDialog(false);
      resetForm();
    } catch (error) {
      // Error đã được xử lý trong hook
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tradeName: "",
      genericName: "",
      atcCode: "",
      dosageForm: "",
      strength: "",
      route: "",
      packaging: "",
      storage: "",
      warnings: "",
      activeIngredients: [],
    });
    setStrengthValue("");
    setStrengthUnit("mg");
    setPackagingVial("");
    setPackagingPill("");
    setErrors({});
  };

  return {
    drugs,
    allDrugs,
    showDialog,
    isEditMode,
    selectedDrug,
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
    parseStrength,
    combineStrength,
    parsePackaging,
    combinePackaging,
    validateForm,
    handleSubmit,
    resetForm,
    setSearchAtc,
    handleSearch,
    handleCreate,
    handleEdit,
    handleDelete,
    setShowDialog,
    errors,
    setErrors,
    loading,
    drugsError,
    addDrugMutation,
    updateDrugMutation,
    deleteDrugMutation,
    setStrengthValue,
    setStrengthUnit,
    setShowCustomDosageForm,
    setShowCustomRoute,
    setPackagingVial,
    setPackagingPill,
  };
};
