import { useState } from "react";
import { authMutations } from "../api/mutations";
import { toast } from "sonner";
import { removeVietnameseAccents } from "../../utils/helper";
import { useNavigate } from "react-router-dom";

export const useRegisterBusiness = () => {
  const [businessType, setBusinessType] = useState("pharma_company");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    walletAddress: "",

    name: "",
    taxCode: "",
    address: "",
    companyEmail: "",
    companyPhone: "",
    website: "",
    licenseNumber: "",
    description: "",
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
      setFormData({ ...formData, [name]: cleanedValue });
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

    setLoading(true);

    try {
      const { confirmPassword, companyEmail, companyPhone, ...registerData } =
        formData;

      const payload = {
        ...registerData,
        company: {
          name: registerData.name,
          taxCode: registerData.taxCode,
          address: registerData.address,
          email: companyEmail,
          phone: companyPhone,
          website: registerData.website,
          licenseNumber: registerData.licenseNumber,
          description: registerData.description,
        },
      };

      delete payload.name;
      delete payload.taxCode;
      delete payload.address;
      delete payload.website;
      delete payload.licenseNumber;
      delete payload.description;

      const routeMap = {
        pharma_company: "pharma-company",
        distributor: "distributor",
        pharmacy: "pharmacy",
      };
      const route = routeMap[businessType] || businessType;

      const response = await registerMutation.mutateAsync({
        ...payload,
        role: route,
      });
      if (response.success) {
        toast.success("Đăng ký thành công! Vui lòng chờ admin phê duyệt.");
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
    businessType,
    formData,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
    setBusinessType,
  };
};
