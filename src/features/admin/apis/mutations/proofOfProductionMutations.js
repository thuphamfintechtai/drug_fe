import api from "../../../utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFixBrokenDataMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(
        "/proof-of-production/fix-broken-data",
        { payload }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Fix broken data thành công!");
      queryClient.invalidateQueries({ queryKey: ["listProofs"] });
      queryClient.invalidateQueries({ queryKey: ["getProductionStats"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Fix broken data thất bại"
      );
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofOfProductionMutations = {
  fixBrokenData: useFixBrokenDataMutation,
};
