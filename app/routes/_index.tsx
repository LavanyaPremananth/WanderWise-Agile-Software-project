import { type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils";
import bannerImg from "~/assets/anthony-delanoix-aDxmYZtYj7g-unsplash.jpg";
import subBannerImg from "~/assets/karsten-winegeart-oXYN8S_pnjw-unsplash.jpg";
import { config } from "~/lib/config";
import { db } from "~/lib/db.server";
import { formatLocation } from "~/lib/formatLocation";
import { trpc } from "~/lib/trpc";
import { createTrpcSSR } from "~/lib/trpc/createTrpcSSR.server";
import { FeatCard } from "~/lib/ui/FeatCard";
import { Footer } from "~/lib/ui/Footer";
import { HomeSearchBar } from "~/lib/ui/HomeSearchBar";
import { ListCard } from "~/lib/ui/ListCard";
import { Nav } from "~/lib/ui/Nav";

export const meta: V2_MetaFunction = () => [
  { title: config.siteName },
  { name: "description", content: `Welcome to ${config.siteName}!` },
];

export async function loader({ request }: LoaderArgs) {
  const { ssr, headers } = await createTrpcSSR(request);
  ssr.filterOptions.countries.fetch();

  const featured = db.room.findMany({
    include: { hotel: { include: { hotelImage: true } } },
    where: { featured: true },
    orderBy: { hotel: { baseRating: "desc" } },
    take: 3,
  });

  const listing = db.room.findMany({
    include: { hotel: { include: { hotelImage: true } } },
    where: { featured: false },
    orderBy: { hotel: { baseRating: "desc" } },
    take: 10,
  });

  return jsonHash(
    {
      ssr: await ssr.dehydrate(),
      featured: Promise.resolve(featured),
      listing: Promise.resolve(listing),
    },
    { headers },
  );
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <trpc.SWRConfig value={{ fallback: loaderData.ssr }}>
      <div>
        <Nav hideHomeText />
        <div className="relative mb-24">
          <img className="aspect-[27/9] w-full object-cover" src={bannerImg} />
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <h1 className=" text-center text-2xl font-light text-white drop-shadow">
              Welcome to <br />
              <span className="text-7xl font-bold italic">WanderWise</span>
            </h1>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex translate-y-16 justify-center px-24">
            <HomeSearchBar className="max-w-4xl" />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl justify-center gap-x-8 px-8 py-4">
          {loaderData.featured.map((r) => (
            <FeatCard
              key={r.id}
              id={r.id}
              name={r.hotel.name}
              desc={r.hotel.description ?? ""}
              location={formatLocation({
                city: r.hotel.city,
                country: r.hotel.country,
              })}
              src={r.hotel.hotelImage?.[0]?.src ?? ""}
            />
          ))}
        </div>
        <div className="py-8">
          <img
            className="aspect-[32/9] w-full object-cover object-center"
            src={subBannerImg}
          />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-y-8 px-8 py-4">
          {loaderData.listing.map((r) => (
            <ListCard
              key={r.id}
              id={r.id}
              name={r.hotel.name}
              location={formatLocation({
                city: r.hotel.city,
                country: r.hotel.country,
              })}
              desc={r.hotel.description ?? ""}
              rating={r.hotel.baseRating ?? 0}
              src={r.hotel.hotelImage?.[0]?.src ?? ""}
            />
          ))}
        </div>
        <Footer />
      </div>
    </trpc.SWRConfig>
  );
}
