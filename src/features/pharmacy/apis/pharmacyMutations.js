import api from "../../utils/api";
import { useMutation } from "@tanstack/react-query";

export const pharmacyMutations = {
  confirmReceipt: (data) => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post(
          "/pharmacy/invoices/confirm-receipt",
          data
        );
        return response.data;
      },
    });
  },
};
