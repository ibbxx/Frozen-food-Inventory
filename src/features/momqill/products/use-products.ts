import { useQuery } from "@tanstack/react-query";
import { fetchMomqillProducts } from "./products-service";

export function useMomqillProducts() {
  return useQuery({
    queryKey: ["momqill", "products"],
    queryFn: fetchMomqillProducts,
  });
}
