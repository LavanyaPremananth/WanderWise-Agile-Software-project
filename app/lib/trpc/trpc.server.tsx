import { initTRPC } from "@trpc/server";
import { type createTrpcContext } from "~/lib/trpc/createTrpcContext.server";

export const ts = initTRPC.context<typeof createTrpcContext>().create();
