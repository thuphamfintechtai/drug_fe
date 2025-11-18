import api from "../../../utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const invoiceMutations = {
  createInvoice: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (payload) => {
        const response = await api.post("/invoice", payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success("Tạo hóa đơn thành công!");
        queryClient.invalidateQueries({ queryKey: ["listInvoices"] });
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Tạo hóa đơn thất bại"
        );
      },
    });
  },
};
