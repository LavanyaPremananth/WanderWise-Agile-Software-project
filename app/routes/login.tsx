import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useZorm } from "react-zorm";
import { safeRedirect } from "remix-utils";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { config } from "~/lib/config";
import { crypt } from "~/lib/crypt.server";
import { db } from "~/lib/db.server";
import { commitSession, getSession, withSession } from "~/lib/session.server";
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

export default function Login() {
  const actionData = useActionData<typeof action>();
  const zo = useZorm("login", schema);
  const [searchParams] = useSearchParams();

  const didRegister = searchParams.get("registered") === "true";

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

      {didRegister && (
        <div className="bg-teal-500 p-4 text-white">
          Account successfully created
        </div>
      )}
      <Form
        ref={zo.ref}
        method="post"
        className="mb-2 flex w-96 flex-col items-center gap-y-4 p-4"
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
          icon={faLock}
          type="password"
          name={zo.fields.password()}
          placeholder="Password"
          autoComplete="current-password"
          error={zo.errors.password() != null}
        />

        {zo.errors.password(({ message }) => (
          <ErrorMsg>{message}</ErrorMsg>
        ))}

        <FormButton type="submit" className="w-32">
          Log In
        </FormButton>
      </Form>

      <div className="text-white">
        <span className="mr-2">Need an account?</span>
        <a href="/register" className="font-bold underline hover:opacity-75">
          Sign Up
        </a>
      </div>
    </div>
  );
}

const schema = zfd.formData({
  email: zfd.text(z.string().min(1).email()),
  password: zfd.text(z.string().min(1)),
});

export async function action({ request }: ActionArgs) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const redirectTo = searchParams.get("redirect") ?? "/";

    const formData = await request.formData();

    const data = schema.parse(formData);

    const { id, passwordHash } = await db.user.findFirstOrThrow({
      where: { email: data.email },
    });

    const didPasswordMatch = await crypt.verify(passwordHash, data.password);

    if (!didPasswordMatch) {
      return json({ error: "Incorrect email or password" }, { status: 400 });
    }

    return withSession(request, async (session) => {
      session.set("userId", id);

      return redirect(safeRedirect(redirectTo, "/"));
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Incorrect email or password" }, { status: 400 });
  }
}
