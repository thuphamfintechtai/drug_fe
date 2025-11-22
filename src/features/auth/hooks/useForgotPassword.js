import { useState } from "react";
import { useForgotPasswordMutation } from "../api/mutations";
import { toast } from "sonner";
import { removeVietnameseAccents } from "../../utils/helper";

export const useForgotPassword = () => {
  const [role, setRole] = useState("pharma_company");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    taxCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "email" ||
      name === "username" ||
      name === "taxCode" ||
      name === "phone"
    ) {
      const cleanedValue = removeVietnameseAccents(value);
      setFormData({ ...formData, [name]: cleanedValue.toLowerCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        ...formData,
        role,
      });

      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    success,
    handleChange,
    handleSubmit,
    role,
    setRole,
  };
};
