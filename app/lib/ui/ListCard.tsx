import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconChevronRight } from "~/lib/ui/Icon/ChevronRight";

type props = {
  id: string;
  name: string;
  location: string;
  desc: string;
  rating: number;
  src: string;
};

export function ListCard(props: props) {
  return (
    <article className="grid grid-cols-5 grid-rows-[repeat(3,auto)] gap-x-4 gap-y-4 rounded-xl bg-teal-50 shadow-lg">
      <img
        className="row-span-3 aspect-[4/3] h-full rounded-l-xl object-cover object-center"
        src={props.src}
      />

      <h1 className="self-center pt-4 text-xl font-medium text-teal-800">
        {props.name}
      </h1>
      <h2 className="self-center pt-4 text-lg text-teal-800/50">
        {props.location}
      </h2>

      <div className="flex self-center pt-4 text-teal-500">
        <FontAwesomeIcon
          fixedWidth
          icon={props.rating >= 1 ? fasStar : farStar}
        />
        <FontAwesomeIcon
          fixedWidth
          icon={props.rating >= 2 ? fasStar : farStar}
        />
        <FontAwesomeIcon
          fixedWidth
          icon={props.rating >= 3 ? fasStar : farStar}
        />
        <FontAwesomeIcon
          fixedWidth
          icon={props.rating >= 4 ? fasStar : farStar}
        />
        <FontAwesomeIcon
          fixedWidth
          icon={props.rating >= 5 ? fasStar : farStar}
        />
      </div>
      <div className="col-span-3 col-start-2 row-span-2 row-start-2">
        <p className="mb-4 line-clamp-4 text-sm text-teal-800">{props.desc}</p>
      </div>
      <div className="col-end-[-1] row-span-3 row-start-1 flex items-center justify-end pr-8 pt-2 text-sm font-medium text-teal-500 transition duration-300 hover:opacity-50">
        <a
          href={`/detail/${props.id}`}
          className="flex items-center rounded-lg bg-teal-500 px-3 py-2 text-lg text-white"
        >
          More <IconChevronRight className="-ml-1 inline-block" />
        </a>
      </div>
    </article>
  );
}
