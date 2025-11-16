import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { removeVietnameseAccents } from "../../utils/helper";
import { useMetaMask } from "../../shared/hooks/useMetaMask";
import {
  compareWalletAddresses,
  formatWalletAddress,
} from "../../utils/walletUtils";
import { authMutations } from "../api/mutations";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { account, isConnected, connect } = useMetaMask();
  const loginMutation = authMutations.login();

  const handleEmailChange = (e) => {
    const value = removeVietnameseAccents(e.target.value);
    setEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = removeVietnameseAccents(e.target.value);
    setPassword(value);
  };

  const handleConnectMetaMask = async () => {
    const connected = await connect();
    if (connected) {
      toast.success("Đã kết nối MetaMask thành công!");
    } else {
      toast.error("Không thể kết nối MetaMask. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (!result.success) {
        setError(result.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      const user = result.data?.user || result.data;
      const userRole = user?.role || result.data?.role;

      if (!userRole) {
        setError("Không thể xác định vai trò người dùng");
        setLoading(false);
        return;
      }

      if (user.walletAddress && userRole !== "system_admin") {
        if (!isConnected || !account) {
          setError(
            "Tài khoản này yêu cầu kết nối MetaMask. Vui lòng kết nối MetaMask trước khi đăng nhập."
          );
          setLoading(false);
          setTimeout(() => {
            handleConnectMetaMask();
          }, 100);
          return;
        }

        if (!compareWalletAddresses(user.walletAddress, account)) {
          const requiredAddress = formatWalletAddress(user.walletAddress);
          setError(
            `Địa chỉ ví MetaMask không khớp với tài khoản. Tài khoản yêu cầu: ${requiredAddress}. Vui lòng kết nối đúng ví MetaMask.`
          );
          setLoading(false);
          return;
        }
      }

      switch (userRole) {
        case "system_admin":
          navigate("/admin");
          break;
        case "pharma_company":
          navigate("/manufacturer");
          break;
        case "distributor":
          navigate("/distributor");
          break;
        case "pharmacy":
          navigate("/pharmacy");
          break;
        default:
          navigate("/user");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    loading,
    showPassword,
    handleEmailChange,
    handlePasswordChange,
    handleConnectMetaMask,
    handleSubmit,
    setShowPassword,
  };
};
