import api from "../../../utils/api";
import { useMutation } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useCreateProofToPharmacy = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/proof-of-pharmacy/pharmacy/create-delivery",
        data
      );
      return response.data;
    },
  });
};

export const useUpdatePharmacyDeliveryStatus = () => {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(
        `/proof-of-pharmacy/pharmacy/${id}/status`,
        data
      );
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofOfPharmacyMutations = {
  createProofToPharmacy: useCreateProofToPharmacy,
  updatePharmacyDeliveryStatus: useUpdatePharmacyDeliveryStatus,
};
