import { createClient, cacheExchange, fetchExchange } from "urql";

export const urqlClient = createClient({
  url: process.env.NEXT_PUBLIC_SALEOR_API_URL || "http://localhost:8000/graphql/",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    credentials: "include"
  }
}); 