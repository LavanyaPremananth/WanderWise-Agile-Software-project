import { IconChevronRight } from "~/lib/ui/Icon/ChevronRight";

type props = {
  id: string;
  name: string;
  location: string;
  desc: string;
  src: string;
};

export function FeatCard(props: props) {
  return (
    <article className="flex flex-1 flex-col rounded-xl bg-teal-50 shadow-lg">
      <img
        className="aspect-video w-full rounded-t-xl object-cover object-center"
        src={props.src}
      />

      <div className="px-4 py-2">
        <h1 className="text-xl font-medium text-teal-800">{props.name}</h1>
        <h2 className="mb-2 text-lg text-teal-800/50">{props.location}</h2>
        <p className="line-clamp-5 text-sm text-teal-800">{props.desc}</p>
        <div className="flex justify-end pt-2 text-sm font-medium text-teal-500 transition duration-300 hover:opacity-50">
          <a href={`/detail/${props.id}`}>
            More <IconChevronRight className="-ml-1 inline-block" />
          </a>
        </div>
      </div>
    </article>
  );
}
