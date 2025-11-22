import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useSearchDrugByATCCode = (atcCode) => {
  return useQuery({
    queryKey: ["searchDrugByATCCode", atcCode],
    queryFn: async () => {
      const response = await api.get(`/public/drugs/search`, {
        params: { atcCode },
      });
      return response.data;
    },
    enabled: !!atcCode,
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const drugQueries = {
  searchDrugByATCCode: useSearchDrugByATCCode,
};
