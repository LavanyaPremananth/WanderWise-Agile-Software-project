import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "@remix-run/react";
import clsx from "clsx";

type HotelDetails = {
  hotelName: string;
  hotelLocation: string;
  description: string;
  rating: number;
  price: number;
  src: string;
};

type DetailBoxProps = {
  className?: string;
  details: HotelDetails;
  hide?: { cta?: boolean };
};

export function DetailBox(props: DetailBoxProps) {
  return (
    <div className={clsx(props.className, "relative flex w-full")}>
      <div className="flex w-full gap-x-8 rounded-lg bg-teal-50 px-6 py-4 text-teal-800 shadow-lg ring-2 ring-transparent transition duration-300 placeholder:text-teal-600/40 focus:outline-none focus:ring-teal-400">
        <TextSideBox hide={props.hide} details={props.details} />
        <ActionSideBox hide={props.hide} details={props.details} />
      </div>
    </div>
  );
}

function TextSideBox(props: Pick<DetailBoxProps, "details" | "hide">) {
  const { hotelName, hotelLocation, description } = props.details;

  return (
    <article className="flex flex-grow flex-col">
      <header className="flex">
        <div className="flex-grow">
          <h1 className="mb-1 text-3xl font-medium text-teal-800">
            {hotelName}
          </h1>
          <h1 className="mb-4 text-xl text-teal-800/50">{hotelLocation}</h1>
        </div>
        <div className="flex flex-shrink-0 items-start gap-x-4">
          <Rating details={props.details} />
        </div>
      </header>
      <p className="text-teal-800">{description}</p>
    </article>
  );
}

function Rating(props: Pick<DetailBoxProps, "details">) {
  const { rating } = props.details;

  return (
    <div className="text-2xl opacity-75">
      <FontAwesomeIcon fixedWidth icon={rating >= 1 ? fasStar : farStar} />
      <FontAwesomeIcon fixedWidth icon={rating >= 2 ? fasStar : farStar} />
      <FontAwesomeIcon fixedWidth icon={rating >= 3 ? fasStar : farStar} />
      <FontAwesomeIcon fixedWidth icon={rating >= 4 ? fasStar : farStar} />
      <FontAwesomeIcon fixedWidth icon={rating >= 5 ? fasStar : farStar} />
    </div>
  );
}

function ActionSideBox(props: Pick<DetailBoxProps, "details" | "hide">) {
  const { id } = useParams();

  return (
    <div className="flex flex-shrink-0 flex-col gap-y-8">
      <div>
        <h3 className="text-5xl font-bold">
          USD {props.details.price?.toFixed(2) ?? "XX.XX"}
        </h3>
        <p className="text-right text-lg font-medium">/ night</p>
      </div>
      {props.hide?.cta != true && (
        <div className="self-end">
          <a
            href={`/detail/${id}/book`}
            className="block items-center justify-center rounded-lg border-2 border-teal-500 bg-teal-500 px-6 py-2 text-center text-3xl text-white text-white transition duration-300 hover:border-teal-400 hover:bg-teal-400"
          >
            Book Now
          </a>
        </div>
      )}
    </div>
  );
}
