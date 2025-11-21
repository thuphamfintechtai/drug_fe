import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const drugQueries = {
  searchDrugByATCCode: (atcCode) => {
    return useQuery({
      queryKey: ["searchDrugByATCCode", atcCode],
      queryFn: async () => {
        const response = await api.get(`/public/drugs/search`, {
          params: { atcCode },
        });
        return response.data;
      },
    });
  },
};
