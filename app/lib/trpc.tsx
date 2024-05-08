import { createSWRProxyHooks } from "@trpc-swr/client";
import { createSWRInfiniteProxy } from "@trpc-swr/infinite";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "~/lib/trpc/appRouter.server";

export const trpc = createSWRProxyHooks<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});

export const trpcInfy = createSWRInfiniteProxy(trpc);

export const trpcDirect = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});
