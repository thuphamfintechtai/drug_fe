import api from "../../utils/api";
import { useMutation } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const usePharmacyConfirmReceipt = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/pharmacy/invoices/confirm-receipt",
        data
      );
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const pharmacyMutations = {
  confirmReceipt: usePharmacyConfirmReceipt,
};
