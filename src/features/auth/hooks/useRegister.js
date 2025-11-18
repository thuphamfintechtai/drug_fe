import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeVietnameseAccents } from "../../utils/helper";
import { toast } from "sonner";
import { authMutations } from "../api/mutations";

export const useRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = authMutations.register();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "password" || name === "confirmPassword") {
      const cleanedValue = removeVietnameseAccents(value);
      setFormData({ ...formData, [name]: cleanedValue.toLowerCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await registerMutation.mutateAsync({
        ...registerData,
        role: "user",
      });

      if (response.success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        toast.error(response.message || "Đăng ký thất bại");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    showPassword,
    handleChange,
    handleSubmit,
  };
};
