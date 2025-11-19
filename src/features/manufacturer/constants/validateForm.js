export const validateForm = (formData, setErrors) => {
  const newErrors = {};

  if (!formData.drugId) {
    newErrors.drugId = "Vui lòng chọn thuốc";
  }

  if (!formData.mfgDate) {
    newErrors.mfgDate = "Vui lòng nhập ngày sản xuất";
  }

  if (!formData.expDate) {
    newErrors.expDate = "Vui lòng nhập ngày hết hạn";
  }

  if (!formData.quantity) {
    newErrors.quantity = "Vui lòng nhập số lượng";
  } else if (parseInt(formData.quantity) <= 0) {
    newErrors.quantity = "Số lượng phải lớn hơn 0";
  }

  // Validate dates
  if (formData.mfgDate && formData.expDate) {
    const mfgDate = new Date(formData.mfgDate);
    const expDate = new Date(formData.expDate);

    if (mfgDate >= expDate) {
      newErrors.expDate = "Ngày hết hạn phải sau ngày sản xuất";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
