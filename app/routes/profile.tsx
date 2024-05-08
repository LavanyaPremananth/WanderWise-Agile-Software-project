import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";
import { createCustomIssues, useZorm } from "react-zorm";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { assertUserId } from "~/lib/assertUserId.server";
import { crypt } from "~/lib/crypt.server";
import { db } from "~/lib/db.server";
import { minLen } from "~/lib/minLen";
import { BookingCard } from "~/lib/ui/BookingCard";
import { ErrorMsg } from "~/lib/ui/ErrorMsg";
import { Footer } from "~/lib/ui/Footer";
import { FormButton } from "~/lib/ui/Form/Button";
import { FormNewTextboxInvert } from "~/lib/ui/Form/NewTextboxInvert";
import { Nav } from "~/lib/ui/Nav";

export async function loader({ request }: LoaderArgs) {
  const { userId } = await assertUserId({ request });

  const bookings = await db.booking.findMany({
    include: {
      room: { include: { hotel: { include: { hotelImage: true } } } },
    },
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return json({ bookings });
}

const schema = zfd
  .formData({
    email: zfd.text(z.string().email().optional()),
    oldPassword: zfd.text(z.string().min(6, minLen(6)).optional()),
    password: zfd.text(z.string().min(6, minLen(6)).optional()),
    confirmPassword: zfd.text(z.string().min(6, minLen(6)).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.oldPassword) {
      if (!data.password) {
        ctx.addIssue({
          code: "invalid_type",
          path: ["password"],
          message: "New Password is required",
          expected: "string",
          received: "undefined",
        });
      }

      if (!data.confirmPassword) {
        ctx.addIssue({
          code: "invalid_type",
          path: ["confirmPassword"],
          message: "Confirm New Password is required",
          expected: "string",
          received: "undefined",
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords must match",
        });
      }
    }
  });

export default function Profile() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [search, setSearch] = useSearchParams();

  const zo = useZorm("profile", schema, {
    customIssues: actionData?.issues,
    onValidSubmit(event) {
      if (Object.values(event.data).every((v) => !v)) {
        event.preventDefault();
      }
    },
  });

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (search.get("success") === "true") {
      zo.form?.reset();

      setSearch((s) => {
        const newS = new URLSearchParams(s);
        newS.delete("success");

        return newS;
      });
    }

    if (search.get("emailUpdated") === "true") {
      alert("Email updated");

      setSearch((s) => {
        const newS = new URLSearchParams(s);
        newS.delete("emailUpdated");

        return newS;
      });
    }
  }, [search]);

  return (
    <div>
      <Nav />

      <h1 className="my-8 text-center text-4xl font-medium text-teal-800">
        Profile
      </h1>

      <h2 className="my-8 text-center text-2xl font-medium text-teal-800">
        Past Bookings
      </h2>

      <div className="mx-auto flex max-w-6xl flex-col gap-y-8 px-8 py-4">
        {loaderData.bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            id={booking.room.id}
            name={booking.room.hotel.name}
            location={booking.room.name}
            startDate={booking.startDate}
            endDate={booking.endDate}
            src={booking.room.hotel.hotelImage.at(0)?.src ?? ""}
          />
        ))}
      </div>

      <h2 className="my-8 text-center text-2xl font-medium text-teal-800">
        Update Details
      </h2>

      <Form method="POST" ref={zo.ref} className="mx-auto w-96">
        <fieldset
          className="flex flex-col items-center gap-y-4"
          disabled={isSubmitting}
        >
          <FormNewTextboxInvert
            icon={faEnvelope}
            type="text"
            name={zo.fields.email()}
            placeholder="Email"
            autoComplete="username"
            error={zo.errors.email() != null}
          />
          {zo.errors.email(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormNewTextboxInvert
            icon={faLock}
            type="password"
            name={zo.fields.oldPassword()}
            placeholder="Current Password"
            autoComplete="old-password"
            error={zo.errors.oldPassword() != null}
          />
          {zo.errors.oldPassword(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormNewTextboxInvert
            icon={faLock}
            type="password"
            name={zo.fields.password()}
            placeholder="New Password"
            autoComplete="new-password"
            error={zo.errors.password() != null}
          />
          {zo.errors.password(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormNewTextboxInvert
            icon={faLock}
            type="password"
            name={zo.fields.confirmPassword()}
            placeholder="Confirm New Password"
            autoComplete="new-password"
            error={zo.errors.confirmPassword() != null}
          />
          {zo.errors.confirmPassword(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormButton type="submit" className="w-48">
            Update
          </FormButton>
        </fieldset>
      </Form>

      <Footer />
    </div>
  );
}

export async function action({ request }: ActionArgs) {
  const { userId } = await assertUserId({ request, throwError: true });

  const issues = createCustomIssues(schema);
  const data = await schema.parseAsync(await request.formData());

  return await db
    .$transaction(async (tx) => {
      let didUpdateEmail = false;
      let didUpdatePassword = false;

      if (data.email) {
        const willChangeEmail =
          (await tx.user.findUnique({ where: { id: userId } }))?.email !==
          data.email;

        const isEmailUnique =
          (await tx.user.findUnique({ where: { email: data.email } })) == null;

        if (!isEmailUnique && willChangeEmail) {
          issues.email("Email already in use");
        }

        if (!issues.hasIssues() && willChangeEmail) {
          await tx.user.update({
            where: { id: userId },
            data: { email: data.email },
          });

          didUpdateEmail = true;
        }
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      if (data.oldPassword && data.password && data.confirmPassword) {
        const didPasswordMatch = await crypt.verify(
          user.passwordHash,
          data.oldPassword,
        );

        if (!didPasswordMatch) {
          issues.oldPassword("Incorrect Password");
        }

        if (!issues.hasIssues()) {
          await tx.user.update({
            where: { id: userId },
            data: { passwordHash: await crypt.hash(data.password) },
          });
        }
      }

      if (issues.hasIssues()) {
        throw null;
      }

      const search = new URLSearchParams();

      search.set("success", "true");

      if (didUpdateEmail) {
        search.set("emailUpdated", "true");
      }
      if (didUpdatePassword) {
        search.set("passwordUpdated", "true");
      }

      return redirect(`/profile?${search.toString()}`);
    })
    .catch(() => {
      return json({ issues: issues.toArray() }, { status: 400 });
    });
}
