import api from "../../../utils/api";
import { useMutation } from "@tanstack/react-query";

export const proofOfPharmacyMutations = {
  createProofToPharmacy: (data) => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post(
          "/proof-of-pharmacy/pharmacy/create-delivery",
          data
        );
        return response.data;
      },
    });
  },

  updatePharmacyDeliveryStatus: () => {
    return useMutation({
      mutationFn: async (id, data) => {
        const response = await api.put(
          `/proof-of-pharmacy/pharmacy/${id}/status`,
          data
        );
        return response.data;
      },
    });
  },
};
