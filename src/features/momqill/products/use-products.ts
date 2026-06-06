import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchMomqillProducts } from "./products-service";

export function useMomqillProducts() {
  return useQuery({
    queryKey: momqillQueryKeys.productList(),
    queryFn: fetchMomqillProducts,
  });
}
