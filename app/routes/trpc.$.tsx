import { type DataFunctionArgs } from "@remix-run/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/lib/trpc/appRouter.server";
import { createTrpcContext } from "~/lib/trpc/createTrpcContext.server";

async function dataFn({ request }: DataFunctionArgs) {
  return fetchRequestHandler({
    createContext: createTrpcContext,
    endpoint: "/trpc",
    req: request,
    router: appRouter,
  });
}

export { dataFn as action, dataFn as loader };
