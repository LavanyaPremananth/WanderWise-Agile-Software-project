import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

type props = Omit<React.ComponentPropsWithoutRef<"input">, "className"> & {
  icon: IconProp;
  error?: boolean;
};

export function FormNewTextbox({ icon, error, ...props }: props) {
  return (
    <div
      className={clsx(
        error
          ? "bg-red-500 bg-opacity-30 focus-within:bg-opacity-40 focus-within:ring-red-600"
          : "bg-white bg-opacity-30 focus-within:bg-opacity-50 focus-within:ring-white",
        "flex w-full rounded-full  ring-2 ring-transparent transition duration-300 focus-within:ring-white",
      )}
    >
      <div className="flex items-center justify-center rounded-l-full py-2 pl-3 pr-1.5 text-white">
        <FontAwesomeIcon fixedWidth icon={icon} />
      </div>
      <input
        className={clsx(
          error ? "text-red-800" : "text-teal-900",
          "flex-grow rounded-r-full bg-transparent py-2 pl-2 pr-6 placeholder:text-white/75 focus:outline-none",
        )}
        {...props}
      />
    </div>
  );
}
