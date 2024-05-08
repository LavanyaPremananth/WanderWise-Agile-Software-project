import { config } from "@fortawesome/fontawesome-svg-core";
import { cssBundleHref } from "@remix-run/css-bundle";
import { type LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import stylesCss from "~/styles.css";

config.autoAddCss = false;

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesCss },
];

export default function App() {
  const [client] = useState(() => trpc.createClient());

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <trpc.Provider client={client}>
          <Outlet />
        </trpc.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
