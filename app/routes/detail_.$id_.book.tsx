import { createId } from "@paralleldrive/cuid2";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Datepicker, {
  type DateType,
  type DateValueType,
} from "react-tailwindcss-datepicker";
import { useZorm } from "react-zorm";
import { badRequest, notFound } from "remix-utils";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { assertUserId } from "~/lib/assertUserId.server";
import { db } from "~/lib/db.server";
import { formatLocation } from "~/lib/formatLocation";
import { DetailBox } from "~/lib/ui/DetailBox";
import { Footer } from "~/lib/ui/Footer";
import { Nav } from "~/lib/ui/Nav";

export async function loader({ request, params }: LoaderArgs) {
  await assertUserId({ request });

  const { id } = params;

  if (!id) throw notFound(null);

  const room = await db.room
    .findUniqueOrThrow({
      include: { hotel: { include: { hotelImage: true } } },
      where: { id },
    })
    .catch(() => {
      throw notFound(null);
    });

  return json({ room });
}

const schema = zfd.formData({
  startDate: zfd.text(z.coerce.date()),
  endDate: zfd.text(z.coerce.date()),
});

export default function Detail_$id_Book() {
  const loaderData = useLoaderData<typeof loader>();

  const [dateRange, setDateRange] = useState<DateValueType | null>(null);

  const [{ minDate, maxDate }] = useState(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 49);

    return { minDate, maxDate };
  });

  const hotelName = loaderData.room.hotel.name;
  const hotelLocation = formatLocation({
    city: loaderData.room.hotel.city,
    country: loaderData.room.hotel.country,
  });

  const zo = useZorm("book", schema);

  useEffect(() => {
    document.querySelector<HTMLInputElement>("input[name=dateRange]")?.focus();
  }, []);

  return (
    <Form method="POST" ref={zo.ref}>
      <input
        type="hidden"
        name={zo.fields.startDate()}
        value={toIsoString(dateRange?.startDate)}
      />
      <input
        type="hidden"
        name={zo.fields.endDate()}
        value={toIsoString(dateRange?.endDate)}
      />

      <div>
        <Nav />

        <div>
          <h1 className="mb-8 mt-8 text-center text-4xl text-teal-900">
            You are now booking for:
          </h1>
          <div className="flex justify-center px-24">
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
              hide={{ cta: true }}
            />
          </div>

          <div className="mx-auto flex max-w-4xl gap-x-4 pb-96 pt-8">
            <Datepicker
              minDate={minDate}
              maxDate={maxDate}
              containerClassName={(c) => clsx(c, "drop-shadow-lg")}
              primaryColor="teal"
              value={dateRange}
              onChange={setDateRange}
              popoverDirection="down"
            />

            <button
              type="submit"
              className="flex-shrink-0 rounded-lg bg-teal-500 px-6 text-white"
            >
              Submit
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </Form>
  );
}

function toIsoString(data: DateType | undefined): string {
  if (!data) return "";

  if (data instanceof Date) {
    return data.toISOString();
  }

  return data;
}

export async function action({ request, params }: ActionArgs) {
  const { id } = params;

  if (!id) throw badRequest(null);

  const { userId } = await assertUserId({ request, throwError: true });

  const { startDate, endDate } = await schema.parseAsync(
    await request.formData(),
  );

  const room = await db.room.findUnique({ where: { id } });

  if (!room) throw notFound(null);

  const booking = await db.booking.create({
    data: { id: createId(), startDate, endDate, userId, roomId: room.id },
  });

  return redirect(`/thank-you?bookingId=${booking.id}`);
}
