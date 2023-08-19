import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { logout } from "../features/auth/authSlice";
import styles from "../styles/Header.module.css";
import LogoImg from "../public/logo.jpeg";

const Header = () => {
  const dispatch = useDispatch();

  const { user, isLoading } = useSelector((store) => store.auth);

  useEffect(() => {
    // capturing the hamburger menu button and container to toggle it
    const hamburgerMenuButton = document.querySelectorAll(
      ".hamburger-menu-button"
    );
    const hamburgerMenuContainer = document.getElementById(
      "hamburger-menu-container"
    );

    // adding click event listeners on all the hamburger menu buttons
    hamburgerMenuButton.forEach((btn) => {
      btn.addEventListener("click", () => {
        hamburgerMenuContainer.classList.toggle("show");
      });
    });

    // remove hamburger menu on outside click
    window.addEventListener("click", (e) =>
      e.target === hamburgerMenuContainer
        ? hamburgerMenuContainer.classList.toggle("show")
        : false
    );
  }, []);

  // remove the 'more/round robin' nav items container on outside click
  useEffect(() => {
    const moreNavContainer = document.getElementById("moreNavContainer");
    const roundRobinNavContainer = document.getElementById(
      "roundRobinNavContainer"
    );
    const supportNavAllContainer = document.getElementById(
      "supportNavAllContainer"
    );
    const supportNavContainer = document.getElementById("supportNavContainer");
    const moreNavoverlay = document.getElementById("MoreNavOverlay");

    const hideMoreNav = (e) => {
      moreNavContainer.style.display = "none";
      roundRobinNavContainer.style.display = "none";
      supportNavContainer.style.display = "none";
      if (document.getElementById("supportNavAllContainer")) {
        supportNavAllContainer.style.display = "none";
      }

      moreNavoverlay.style.display = "none";
    };

    moreNavoverlay.addEventListener("click", hideMoreNav);

    return () => moreNavoverlay.removeEventListener("click", hideMoreNav);
  }, []);

  // show more menu items
  const handleMoreBtn = (e) => {
    if (e.target !== e.currentTarget) {
      // removing 'more' nav menu and overlay
      document.getElementById("MoreNavOverlay").style.display = "none";
      e.currentTarget.firstElementChild.style.display = "none";
      return;
    }
    // displaying 'more' nav menu and overlay
    document.getElementById("MoreNavOverlay").style.display = "block";
    e.currentTarget.firstElementChild.style.display = "flex";
  };

  // show more menu items
  const handleRoundRobinBtn = (e) => {
    if (e.target !== e.currentTarget) {
      // removing 'more' nav menu and overlay
      document.getElementById("MoreNavOverlay").style.display = "none";
      e.currentTarget.firstElementChild.style.display = "none";
      return;
    }
    // displaying 'more' nav menu and overlay
    document.getElementById("MoreNavOverlay").style.display = "block";
    e.currentTarget.firstElementChild.style.display = "flex";
  };

  // show more menu items
  const handleSupportBtn = (e) => {
    if (e.target !== e.currentTarget) {
      // removing 'more' nav menu and overlay
      document.getElementById("MoreNavOverlay").style.display = "none";
      e.currentTarget.firstElementChild.style.display = "none";
      return;
    }
    // displaying 'more' nav menu and overlay
    document.getElementById("MoreNavOverlay").style.display = "block";
    e.currentTarget.firstElementChild.style.display = "flex";
  };

  return (
    <>
      <header className={`${styles.navHeaderContainer} container p-1`}>
        <div className={`${styles.navLogo} mr-2 p-relative`}>
          <Link href="/">
            <a>
              <Image src={LogoImg} />
            </a>
          </Link>
        </div>

        <nav className={`${styles.navWrapper}`}>
          <ul className={`d-flex ${styles.navUl}`}>
            <li className={`mr-1 ${styles.navLi}`}>
              <Link href="/">
                <a className={`${styles.link}`}>Home</a>
              </Link>
            </li>
            <li className={`mr-1 ${styles.navLi}`}>
              <Link href="/world-clock">
                <a className={`${styles.link}`}>World Clock</a>
              </Link>
            </li>
            {/* UPDATE 2 ***************************************************** */}
            <li
              onClick={(e) => handleMoreBtn(e)}
              className={`mr-1 c-pointer p-relative ${styles.navLi}`}
            >
              Events
              {/* more nav items */}
              <div
                id="moreNavContainer"
                style={{
                  position: "absolute",
                  display: "none",
                  top: "2rem",
                  right: "0",
                  boxShadow: "0px 0px 1px 0px rgba(0,0,0,0.1)",
                  transform: "translateX(50%)",
                  width: "max-content",
                  backgroundColor: "#fff",
                  border: "1px solid var(--secondary-color)",
                  overflow: "hidden",
                  zIndex: "101",
                }}
                className={`rounded d-flex flex-column text-center`}
              >
                <Link href="/new-event">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>New Event</a>
                  </span>
                </Link>
                <Link href="/my-events">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>My Events</a>
                  </span>
                </Link>
                <Link href="/scheduled-events">
                  <span
                    style={{ padding: "0.8rem 1rem", display: "inline-block" }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>Scheduled Events</a>
                  </span>
                </Link>
              </div>
            </li>
            <li className={`mr-1 ${styles.navLi}`}>
              <Link href="/integrations">
                <a className={`${styles.link}`}>Integration</a>
              </Link>
            </li>
            <li
              onClick={(e) => handleRoundRobinBtn(e)}
              className={`mr-1 c-pointer p-relative ${styles.navLi}`}
            >
              Round Robin
              {/* more nav items */}
              <div
                id="roundRobinNavContainer"
                style={{
                  position: "absolute",
                  display: "none",
                  top: "2rem",
                  right: "0",
                  boxShadow: "0px 0px 1px 0px rgba(0,0,0,0.1)",
                  transform: "translateX(50%)",
                  width: "max-content",
                  backgroundColor: "#fff",
                  border: "1px solid var(--secondary-color)",
                  overflow: "hidden",
                  zIndex: "101",
                }}
                className={`rounded d-flex flex-column text-center`}
              >
                <Link href="/new-team">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>New Team</a>
                  </span>
                </Link>
                <Link href="/my-teams">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>My Teams</a>
                  </span>
                </Link>
              </div>
            </li>
            <li
              onClick={(e) => handleSupportBtn(e)}
              className={`mr-1 c-pointer p-relative ${styles.navLi}`}
            >
              Support
              {/* more nav items */}
              <div
                id="supportNavContainer"
                style={{
                  position: "absolute",
                  display: "none",
                  top: "2rem",
                  right: "0",
                  boxShadow: "0px 0px 1px 0px rgba(0,0,0,0.1)",
                  transform: "translateX(50%)",
                  width: "max-content",
                  backgroundColor: "#fff",
                  border: "1px solid var(--secondary-color)",
                  overflow: "hidden",
                  zIndex: "101",
                }}
                className={`rounded d-flex flex-column text-center`}
              >
                <Link href="/support">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>New Ticket</a>
                  </span>
                </Link>
                <Link href="/my-tickets">
                  <span
                    style={{
                      padding: "0.8rem 1rem",
                      display: "inline-block",
                      borderBottom: "1px solid var(--secondary-color)",
                    }}
                    className={`c-pointer ${styles.headerMoreNavItems}`}
                  >
                    <a className={`${styles.link}`}>My Tickets</a>
                  </span>
                </Link>
              </div>
            </li>

            {isLoading ? (
              <span className={`mr-2`}>loading...</span>
            ) : user && user.is_admin == 1 ? (
              <li
                onClick={(e) => handleSupportBtn(e)}
                className={`mr-1 c-pointer p-relative ${styles.navLi}`}
              >
                All Tickets
                {/* more nav items */}
                <div
                  id="supportNavAllContainer"
                  style={{
                    position: "absolute",
                    display: "none",
                    top: "2rem",
                    right: "0",
                    boxShadow: "0px 0px 1px 0px rgba(0,0,0,0.1)",
                    transform: "translateX(50%)",
                    width: "max-content",
                    backgroundColor: "#fff",
                    border: "1px solid var(--secondary-color)",
                    overflow: "hidden",
                    zIndex: "101",
                  }}
                  className={`rounded d-flex flex-column text-center`}
                >
                  <Link href="/all-tickets">
                    <span
                      style={{
                        padding: "0.8rem 1rem",
                        display: "inline-block",
                        borderBottom: "1px solid var(--secondary-color)",
                      }}
                      className={`c-pointer ${styles.headerMoreNavItems}`}
                    >
                      <a className={`${styles.link}`}>All Total Tickets</a>
                    </span>
                  </Link>
                  <Link href="/closed-tickets">
                    <span
                      style={{
                        padding: "0.8rem 1rem",
                        display: "inline-block",
                        borderBottom: "1px solid var(--secondary-color)",
                      }}
                      className={`c-pointer ${styles.headerMoreNavItems}`}
                    >
                      <a className={`${styles.link}`}>Closed Tickets</a>
                    </span>
                  </Link>

                  <Link href="/pending-tickets">
                    <span
                      style={{
                        padding: "0.8rem 1rem",
                        display: "inline-block",
                        borderBottom: "1px solid var(--secondary-color)",
                      }}
                      className={`c-pointer ${styles.headerMoreNavItems}`}
                    >
                      <a className={`${styles.link}`}>Pending Tickets</a>
                    </span>
                  </Link>
                </div>
              </li>
            ) : (
              ""
            )}

            {/* UPDATE 2 END ***************************************************** */}
          </ul>
          <div
            id="MoreNavOverlay"
            style={{
              display: "none",
              position: "fixed",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: "100",
            }}
          ></div>
        </nav>

        {isLoading ? (
          <span className={`mr-2`}>loading...</span>
        ) : user ? (
          <div className={`${styles.navHeaderLogin}`}>
            <span className={`mr-1`}>{user.name}</span>
            <span
              className={`cursor-pointer`}
              onClick={() => dispatch(logout())}
            >
              &nbsp;Logout
            </span>
          </div>
        ) : (
          <div className={`${styles.navHeaderLogin}`}>
            <Link href="/login">
              <a>Sign In</a>
            </Link>
          </div>
        )}

        {/* HAMBURGER MENU BUTTON */}
        <div className="hamburger-menu-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            width="18px"
            height="12px"
            style={{
              shapeRendering: "geometricPrecision",
              textRendering: "geometricPrecision",
              imageRendering: "optimizeQuality",
              fillRule: "evenodd",
              clipRule: "evenodd",
            }}
            viewBox="0 0 2.77701 1.85134"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <style type="text/css">
                {`.hamburger-menu.fil0 {fill:#333333}`}
              </style>
            </defs>
            <g id="Layer_x0020_1">
              <metadata id="CorelCorpID_0Corel-Layer" />
              <rect
                className="hamburger-menu fil0"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
              <rect
                className="hamburger-menu fil0"
                y="0.805753"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
              <rect
                className="hamburger-menu fil0"
                y="1.62069"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
            </g>
          </svg>
        </div>
      </header>

      {/* HAMBURGER MENU */}
      <div id="hamburger-menu-container" className="hamburger-menu-container">
        {/* HAMBURGER MENU BUTTON */}
        <div className="hamburger-menu-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            width="18px"
            height="12px"
            style={{
              shapeRendering: "geometricPrecision",
              textRendering: "geometricPrecision",
              imageRendering: "optimizeQuality",
              fillRule: "evenodd",
              clipRule: "evenodd",
            }}
            viewBox="0 0 2.77701 1.85134"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <style type="text/css">
                {`.hamburger-menu.fil00 {fill:#ffffff}`}
              </style>
            </defs>
            <g id="Layer_x0020_1">
              <metadata id="CorelCorpID_0Corel-Layer" />
              <rect
                className="hamburger-menu fil00"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
              <rect
                className="hamburger-menu fil00"
                y="0.805753"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
              <rect
                className="hamburger-menu fil00"
                y="1.62069"
                width="2.77701"
                height="0.23065"
                rx="0.0767757"
                ry="0.0767757"
              />
            </g>
          </svg>
        </div>

        <div id="menu-items" className="menu-items">
          <ul>
            <li>
              <Link href="/new-event">
                <a>Create Event</a>
              </Link>
            </li>
            <li>
              <Link href="/my-events">
                <a>My Events</a>
              </Link>
            </li>
            <li>
              <Link href="/integrations">
                <a>Integrations</a>
              </Link>
            </li>
            <li>
              <Link href="/scheduled-events">
                <a>Scheduled Events</a>
              </Link>
            </li>
            <li>
              <Link href="/support">
                <a>Support</a>
              </Link>
            </li>
          </ul>

          {isLoading ? (
            <>loading...</>
          ) : user ? (
            <div>
              <span className={`mr-1`}>{user.name}</span>
              <span
                className={`cursor-pointer`}
                onClick={() => dispatch(logout())}
              >
                &nbsp;Logout
              </span>
            </div>
          ) : (
            <Link href="/login">
              <a>Sign In</a>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
