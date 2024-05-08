import { createProxySSGHelpers } from "@trpc-swr/ssr";
import { appRouter } from "~/lib/trpc/appRouter.server";
import { createTrpcContext } from "~/lib/trpc/createTrpcContext.server";

export const createTrpcSSR = async (req: Request) => {
  const resHeaders = new Headers();
  return {
    headers: resHeaders,
    ssr: createProxySSGHelpers({
      router: appRouter,
      ctx: await createTrpcContext({ req, resHeaders }),
    }),
  };
};
