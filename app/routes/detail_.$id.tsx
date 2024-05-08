import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { uniqBy } from "rambda";
import { notFound } from "remix-utils";
import { db } from "~/lib/db.server";
import { formatLocation } from "~/lib/formatLocation";
import { DetailBox } from "~/lib/ui/DetailBox";
import { Footer } from "~/lib/ui/Footer";
import { ListCard } from "~/lib/ui/ListCard";
import { Nav } from "~/lib/ui/Nav";

export async function loader({ params }: LoaderArgs) {
  const id = params.id;

  if (!id) throw notFound(null);

  const room = await db.room
    .findUniqueOrThrow({
      where: { id },
      include: { hotel: { include: { hotelImage: true } } },
    })
    .catch(() => {
      throw notFound(null);
    });

  const nearCity = await db.room.findMany({
    include: { hotel: { include: { hotelImage: true } } },
    where: {
      hotel: { city: room.hotel.city, hotelImage: { some: {} } },
      NOT: { id: room.id },
    },
    orderBy: { hotel: { baseRating: "desc" } },
  });

  const nearCountry = await db.room.findMany({
    include: { hotel: { include: { hotelImage: true } } },
    where: {
      hotel: { country: room.hotel.country, hotelImage: { some: {} } },
      NOT: { id: room.id },
    },
    orderBy: { hotel: { baseRating: "desc" } },
  });

  const nearby = uniqBy((room) => room.id, [...nearCity, ...nearCountry]);

  return json({ room, nearby });
}

export default function Detail() {
  const loaderData = useLoaderData<typeof loader>();

  const hotelName = loaderData.room.hotel.name;
  const hotelLocation = formatLocation({
    city: loaderData.room.hotel.city,
    country: loaderData.room.hotel.country,
  });

  const images = loaderData.room.hotel.hotelImage ?? [];

  return (
    <div>
      <Nav />

      <div className="relative mb-60">
        <img
          className="aspect-[27/9] w-full object-cover"
          src={images[0]?.src}
        />

        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center px-24">
          <DetailBox
            className="max-w-4xl"
            details={{
              hotelName,
              hotelLocation,
              rating: loaderData.room.hotel.baseRating ?? 0,
              price: loaderData.room.price,
              description: loaderData.room.hotel.description ?? "",
              src: loaderData.room.hotel.hotelImage?.[0]?.src ?? "",
            }}
          />
        </div>
      </div>

      <div>
        {images.length > 0 && (
          <div className="mb-16 flex w-full flex-col items-center justify-center gap-y-4">
            <div className="flex w-full items-center justify-center gap-x-4">
              {images.map((image) => (
                <div key={image.id} className="aspect-[4/3] h-full w-full">
                  <img className="h-full w-full object-cover" src={image.src} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {loaderData.nearby.length > 0 && (
        <>
          <h2 className="my-8 text-center text-2xl font-medium text-teal-800">
            Related Hotels
          </h2>

          <div className="mx-auto flex max-w-6xl flex-col gap-y-8 px-8 py-4">
            {loaderData.nearby.map((room) => (
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
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
