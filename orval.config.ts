import { defineConfig } from "orval";

export default defineConfig({
  cesar: {
    input: {
      target: "/tmp/cesar-openapi-fixed.yaml",
    },
    output: {
      mode: "tags-split",
      target: "src/api/generated/cesar.ts",
      schemas: "src/api/generated/models",
      client: "react-query",
      prettier: false,
      override: {
        mutator: {
          path: "src/api/client.ts",
          name: "apiClient",
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: false,
        },
        operations: {
          login: {
            mutator: {
              path: "src/api/client.ts",
              name: "loginClient",
            },
          },
        },
      },
      clean: true,
    },
  },
});
