import tw from "tailwind-styled-components";

type props = { $error?: boolean };

export const FormTextbox = tw.input<props>`
	w-full rounded-lg px-4 py-2 placeholder:text-neutral-100 focus:outline-none focus:ring 
	${(p) =>
    p.$error
      ? `bg-red-600/40 text-white focus:ring-red-900/50`
      : `bg-white/30 text-teal-800 focus:ring-black/10`}
`;
