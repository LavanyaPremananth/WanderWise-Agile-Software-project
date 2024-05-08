import { faSquare } from "@fortawesome/free-regular-svg-icons/faSquare";
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons/faSquareCheck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createId } from "@paralleldrive/cuid2";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { createCustomIssues, useZorm } from "react-zorm";
import { mutate } from "swr";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { config } from "~/lib/config";
import { crypt } from "~/lib/crypt.server";
import { db } from "~/lib/db.server";
import { minLen } from "~/lib/minLen";
import { commitSession, getSession } from "~/lib/session.server";
import { ErrorMsg } from "~/lib/ui/ErrorMsg";
import { FormButton } from "~/lib/ui/Form/Button";
import { FormNewTextbox } from "~/lib/ui/Form/NewTextbox";
import IconHome from "~/lib/ui/Icon/Home";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.get("userId")) {
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  return json(null);
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const zo = useZorm("register", schema, {
    customIssues: actionData?.issues ?? [],
  });
  const [didCheck, setDidCheck] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    return () => {
      mutate(() => true);
    };
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-teal-500">
      <a
        href="/"
        className="mb-8 flex flex-col items-center gap-y-2 text-white"
      >
        <IconHome className="!h-24 !w-24" />
        <h1 className="font-kanit text-4xl font-bold italic">
          {config.siteName}
        </h1>
      </a>
      {actionData?.error && (
        <div className="bg-red-500 p-4 text-white">{actionData.error}</div>
      )}

      <Form ref={zo.ref} method="post" className="mb-2 p-4">
        <fieldset
          className="flex w-96 flex-col items-center gap-y-4"
          disabled={isSubmitting}
        >
          <FormNewTextbox
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

          <FormNewTextbox
            icon={faUser}
            type="text"
            name={zo.fields.username()}
            placeholder="Username"
            error={zo.errors.username() != null}
          />
          {zo.errors.username(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormNewTextbox
            icon={faLock}
            type="password"
            name={zo.fields.password()}
            placeholder="Password"
            autoComplete="new-password"
            error={zo.errors.password() != null}
          />
          {zo.errors.password(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}

          <FormNewTextbox
            icon={faLock}
            type="password"
            name={zo.fields.confirm()}
            placeholder="Confirm Password"
            autoComplete="new-password"
            error={zo.errors.confirm() != null}
          />
          {zo.errors.confirm(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}
          <p className="text-sm text-white">
            <label className="flex items-center gap-x-4">
              <input
                type="checkbox"
                name={zo.fields.checked()}
                className="hidden"
                checked={didCheck}
                onChange={(e) => setDidCheck(e.target.checked)}
              />
              <FontAwesomeIcon
                icon={didCheck ? faSquareCheck : faSquare}
                opacity={didCheck ? 1 : 0.5}
                size="xl"
              />
              <span>
                I agree to the WanderWise User Agreement, Privacy Policy, and
                Cookie Policy.
              </span>
            </label>
          </p>
          {zo.errors.checked(({ message }) => (
            <ErrorMsg>{message}</ErrorMsg>
          ))}
          <FormButton type="submit" className="w-48">
            Create Account
          </FormButton>
        </fieldset>
      </Form>

      <div className="text-white">
        <span className="mr-2">Already have an account?</span>
        <a href="/login" className="font-bold underline hover:opacity-75">
          Log In
        </a>
      </div>
    </div>
  );
}

const schema = zfd
  .formData({
    email: zfd.text(z.string().min(1).email()),
    username: zfd.text(z.string().min(1).min(3, minLen(3))),
    password: zfd.text(z.string().min(1).min(6, minLen(6))),
    confirm: zfd.text(z.string().min(1).min(6, minLen(6))),
    checked: zfd.checkbox().refine((c) => c, "Required"),
  })
  .refine(({ password, confirm }) => password === confirm, {
    path: ["confirm"],
    message: "Password must match",
  });

export async function action({ request }: ActionArgs) {
  try {
    const issues = createCustomIssues(schema);
    const formData = await request.formData();

    const data = await schema.parseAsync(formData);

    const isEmailUnique =
      (await db.user.findUnique({ where: { email: data.email } })) == null;

    if (!isEmailUnique) {
      issues.email("Email already in use");
    }

    const isUsernameUnique =
      (await db.user.findUnique({ where: { username: data.username } })) ==
      null;

    if (!isUsernameUnique) {
      issues.username("Username already in use");
    }

    if (issues.hasIssues()) {
      return json({ issues: issues.toArray(), error: null }, { status: 400 });
    }

    const passwordHash = await crypt.hash(data.password);

    await db.user.create({
      data: {
        id: createId(),
        email: data.email,
        username: data.username,
        passwordHash,
      },
    });

    return redirect("/login?registered=true");
  } catch {
    return json(
      { issues: null, error: "An error occurred while creating account" },
      { status: 400 },
    );
  }
}
