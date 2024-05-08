import tw from "tailwind-styled-components";

type SiteTitleProps = { $hide?: boolean };
export const NavSiteTitle = tw.h1<SiteTitleProps>`
  ${(p) => p.$hide && `pointer-events-none invisible`}
  text-2xl font-bold italic transition duration-300 group-hover:opacity-75
`;
