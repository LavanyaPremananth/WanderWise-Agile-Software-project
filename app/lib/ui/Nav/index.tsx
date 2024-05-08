import {
  faRightFromBracket,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "~/lib/config";
import IconHome from "~/lib/ui/Icon/Home";
import { NavLink } from "~/lib/ui/Nav/Link";
import { NavSiteTitle } from "~/lib/ui/Nav/SiteTitle";
import { useUsername } from "~/lib/useUsername";

type props = { hideLogButton?: boolean; hideHomeText?: boolean };

export function Nav({ hideLogButton, hideHomeText }: props) {
  const { username, isLoading } = useUsername();

  return (
    <div className="flex items-center justify-between bg-teal-500 px-4 py-3">
      <a href="/">
        <div className="group flex items-center gap-x-2 text-white">
          <IconHome />
          <NavSiteTitle $hide={hideHomeText}>{config.siteName}</NavSiteTitle>
        </div>
      </a>

      {!isLoading && !hideLogButton && (
        <div className="flex items-center justify-center gap-x-6">
          {username == null ? (
            <NavLink href="/login">
              <FontAwesomeIcon icon={faRightToBracket} />
              Log In
            </NavLink>
          ) : (
            <>
              <NavLink href="/profile">
                <FontAwesomeIcon icon={faUser} />
                Profile
              </NavLink>
              <NavLink href="/logout">
                <FontAwesomeIcon icon={faRightFromBracket} />
                Log Out
              </NavLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}
