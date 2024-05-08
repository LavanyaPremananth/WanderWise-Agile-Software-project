import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import bannerImg from "~/assets/anthony-delanoix-aDxmYZtYj7g-unsplash.jpg";
import { formatLocation } from "~/lib/formatLocation";
import { trpc, trpcInfy } from "~/lib/trpc";
import { createTrpcSSR } from "~/lib/trpc/createTrpcSSR.server";
import { Footer } from "~/lib/ui/Footer";
import { HomeSearchBar } from "~/lib/ui/HomeSearchBar";
import { ListCard } from "~/lib/ui/ListCard";
import { Nav } from "~/lib/ui/Nav";

export async function loader({ request }: LoaderArgs) {
  const { ssr, headers } = await createTrpcSSR(request);

  ssr.filterOptions.countries.fetch();

  return json({ ssr: await ssr.dehydrate() }, { headers });
}

const take = 10;

export default function Search() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData<typeof loader>();

  return (
    <trpc.SWRConfig value={{ fallback: loaderData.ssr }}>
      <div>
        <Nav />

        <div className="relative mb-24">
          <img className="aspect-[27/6] w-full object-cover" src={bannerImg} />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className=" text-center text-2xl font-light text-white drop-shadow"></h1>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex translate-y-16 justify-center px-24">
            <HomeSearchBar
              className="max-w-4xl"
              defaultValue={searchParams.get("q") ?? ""}
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-y-8 px-8 py-4">
          <SEARCH_LIST />
        </div>

        <Footer />
      </div>
    </trpc.SWRConfig>
  );
}

function SEARCH_LIST() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? undefined;
  const ratingStr = searchParams.get("rating") ?? "";
  const rating = ratingStr ? parseInt(ratingStr) : undefined;

  const { data, isLoading, setSize } = trpcInfy.search.useCursor(
    { query, country, rating, take },
    (d) => d?.nextCursor,
  );

  const hasMore = data?.at(-1)?.nextCursor !== null;

  const rooms = data?.flatMap((a) => a.listing);

  return (
    <>
      {rooms?.map((room) => (
        <ListCard
          key={room.id}
          id={room.id}
          name={room.hotel.name}
          desc={room.hotel.description ?? ""}
          location={formatLocation({
            city: room.hotel.city,
            country: room.hotel.country,
          })}
          rating={room.hotel.baseRating ?? 0}
          src={room.hotel.hotelImage?.[0]?.src ?? ""}
        />
      ))}

      <button
        disabled={!hasMore || isLoading}
        onClick={() => setSize((size) => size + 1)}
        className="text-teal-600 hover:opacity-75 disabled:text-neutral-900 disabled:opacity-50"
      >
        {hasMore ? "Click to Load More" : "No More Results"}
      </button>
    </>
  );
}
