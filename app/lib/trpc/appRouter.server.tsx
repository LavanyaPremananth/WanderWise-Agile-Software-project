import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "~/lib/db.server";
import { sessionRouter } from "~/lib/trpc/sessionRouter.server";
import { ts } from "~/lib/trpc/trpc.server";

export const appRouter = ts.router({
  session: sessionRouter,
  filterOptions: ts.router({
    countries: ts.procedure.query(async () => {
      const countries = await db.hotel.findMany({
        select: { country: true },
        distinct: ["country"],
        orderBy: { country: "asc" },
      });

      return countries.map((c) => c.country);
    }),
  }),
  search: ts.procedure
    .input(
      z.object({
        query: z.string(),
        cursor: z.string().nullish(),
        take: z.number().min(1).max(20).int(),
        country: z.string().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .query(async ({ input }) => {
      const isCursorValid = !input.cursor
        ? false
        : (await db.room.findFirst({ where: { id: input.cursor } })) != null;

      type Filter = Prisma.RoomWhereInput;

      const countryFilter = (
        !input.country ? [] : [{ hotel: { country: input.country } }]
      ) satisfies Filter[];

      const ratingFilter = (
        !input.rating ? [] : [{ hotel: { baseRating: { gte: input.rating } } }]
      ) satisfies Filter[];

      const textSearchFilter = {
        OR: [
          { name: { contains: input.query } },
          {
            hotel: {
              OR: [
                { name: { contains: input.query } },
                { city: { contains: input.query } },
                { country: { contains: input.query } },
              ],
            },
          },
        ],
      } satisfies Filter;

      const listing = await db.room.findMany({
        include: { hotel: { include: { hotelImage: true } } },
        where: { AND: [...countryFilter, ...ratingFilter, textSearchFilter] },
        orderBy: { hotel: { baseRating: "desc" } },
        cursor: isCursorValid ? { id: input.cursor! } : undefined,
        skip: isCursorValid ? 1 : 0,
        take: input.take,
      });

      const nextCursor =
        listing.length >= input.take ? listing.at(-1)?.id : null;

      return { listing, nextCursor };
    }),
});

export type AppRouter = typeof appRouter;
