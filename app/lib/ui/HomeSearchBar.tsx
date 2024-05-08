import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useRef } from "react";
import tw from "tailwind-styled-components";
import { trpc } from "~/lib/trpc";

type props = { className?: string; defaultValue?: string };

export function HomeSearchBar(props: props) {
  const { data } = trpc.filterOptions.countries.useSWR();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className={clsx(props.className, "flex w-full flex-col gap-y-4")}>
      <form ref={formRef} className="contents" method="get" action="/search">
        <div className="relative flex w-full">
          <input
            className="h-12 w-full rounded-full bg-teal-50 px-6 text-teal-900 shadow-lg ring-2 ring-transparent transition duration-300 placeholder:text-teal-600/40 focus:outline-none focus:ring-teal-400"
            placeholder="Search Hotels"
            name="q"
            defaultValue={props.defaultValue}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-3 my-auto flex h-8 w-12 items-center justify-center rounded-full bg-teal-500 text-center text-white transition duration-300 hover:bg-teal-400"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Second Row */}

        <div className="flex gap-x-4 px-4">
          <Sel
            name="country"
            defaultValue={searchParams.get("country") ?? ""}
            onChange={() => formRef.current?.submit()}
          >
            <option value="">All Countries</option>
            {data?.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Sel>
          <Sel
            name="rating"
            defaultValue={searchParams.get("rating") ?? ""}
            onChange={() => formRef.current?.submit()}
          >
            <option value="">All Ratings</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </Sel>
        </div>
      </form>
    </div>
  );
}

const Sel = tw.select`rounded-sm px-2 text-neutral-600 focus:text-teal-600 focus:outline-none`;
