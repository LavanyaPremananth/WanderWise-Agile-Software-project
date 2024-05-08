import { createId } from "@paralleldrive/cuid2";
import * as hotels from "~/assets/hotels.json";
import * as images from "~/assets/images.json";
import { crypt } from "~/lib/crypt.server";
import { db } from "~/lib/db.server";

async function main() {
  const testUserEmail = "test@test.com";
  const testUserCount = await db.user.count({
    where: { email: testUserEmail },
  });

  if (testUserCount > 0) {
    console.log("User already seeded");
  } else {
    const user = await db.user.create({
      data: {
        id: createId(),
        username: "Test User",
        email: testUserEmail,
        passwordHash: await crypt.hash("password"),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    console.log("User seeded: ", user);
  }

  const hasHotels = (await db.hotel.count()) > 0;

  if (hasHotels) {
    console.log("Hotels already seeded");
  } else {
    const result = await db.$transaction(
      hotels.map((h, index) =>
        db.hotel.create({
          data: {
            id: createId(),
            hid: h.hotelid.toString(),
            name: h.name,
            country: h.country,
            address: h.address,
            description: h["Hotel Desc"],
            city: h.city,
            baseRating: h.star_rating,
            rooms: {
              create: {
                id: createId(),
                name: h.Rooms,
                description: h.Amenities,
                featured: index < 3,
                price: parseInt(h["Prices (USD)"].toString() || "0"),
              },
            },
          },
        }),
      ),
    );

    console.log(`Seeded ${result.length} hotels`);
  }

  const hasImages = (await db.hotelImage.count()) > 0;

  if (hasImages) {
    console.log("Images already seeded");
  } else {
    db.$transaction(async (db) => {
      for (let i of images) {
        const hasHotel =
          (await db.hotel.findUnique({
            where: { hid: i.roomId.toString() },
          })) != null;

        if (hasHotel) {
          await db.hotelImage.create({
            data: {
              id: createId(),
              src: i.src,
              hotelId: i.roomId.toString(),
              order: i.order,
            },
          });
        }
      }
    });

    console.log(`Seeded images`);
  }
}

main();
