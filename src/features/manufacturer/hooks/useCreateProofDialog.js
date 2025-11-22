import { useState } from "react";

export const useCreateProofDialog = (
  formData,
  setFormData,
  validationResult,
  onSubmit
) => {
  const [errors, setErrors] = useState({});
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };
  const handleSubmit = () => {
    console.log("🏭 CreateProofDialog handleSubmit called");
    if (validationResult()) {
      console.log("🏭 Form validation passed, calling onSubmit");
      onSubmit();
    } else {
      console.log("Form validation failed");
    }
  };

  return {
    errors,
    setErrors,
    handleInputChange,
    handleSubmit,
  };
};
