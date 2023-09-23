"use client";

import React from "react";
import { GearIcon, HomeIcon, DashboardIcon, UploadIcon, EnterIcon, ExitIcon, PlusCircledIcon, VideoIcon } from "@radix-ui/react-icons";
import { useAuthContext } from "@/(context)/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

function NavigationBase() {
  const router = useRouter();
  const { isAuthed, signIn, signOut, account } = useAuthContext();
  const [showButtons, setShowButtons] = React.useState<boolean>(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showButtons &&
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setShowButtons(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Step 3: Cleanup the listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showButtons]);

  if (!signIn || !signOut) {
    return <p>Loading...</p>;
  }

  return (
    <nav className="fixed bottom-0 w-full px-4 py-2 bg-primary items-center flex z-40" aria-label="Main navigation">
      <div className="flex mx-auto w-full justify-between">
        <Link href="/" legacyBehavior passHref>
          <a aria-label="Home" className=" flex-col p-2 h-full flex items-center z-60 cursor-pointer">
            <HomeIcon className="h-6 w-6 mb-0.5" />
            <label className="text-small">Home</label>
          </a>
        </Link>

        <Link href={`/dashboard/${account}`} legacyBehavior passHref>
          <a
            aria-label="Dashboard"
            className={`p-2 h-full flex flex-col items-center z-60  ${isAuthed ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"}`}
            aria-disabled={!isAuthed}
          >
            <DashboardIcon className="h-6 w-6 mb-0.5" />
            <label className="text-small">Dashboard</label>
          </a>
        </Link>

        <Link href={`/dashboard/${account}`} legacyBehavior passHref>
          <a
            aria-label="Settings"
            className={`p-2 h-full flex flex-col items-center z-60  ${isAuthed ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"}`}
            aria-disabled={!isAuthed}
          >
            <GearIcon className="h-6 w-6 mb-0.5" />
            <label className="text-small">Settings</label>
          </a>
        </Link>

        <button
          onClick={async () => {
            if (isAuthed) {
              signOut();
              router.replace("/");
            } else {
              const user = await signIn();
              if (user) {
                router.replace(`/dashboard/${user.address}`);
              }
            }
          }}
          aria-label={isAuthed ? "Sign Out" : "Sign In"}
          className="p-2 h-full flex items-center z-60 cursor-pointer"
        >
          {isAuthed ? <ExitIcon className="h-6 w-6" /> : <EnterIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-50">
        <div className="relative">
          <button
            ref={buttonRef}
            disabled={!isAuthed}
            aria-disabled={!isAuthed}
            onClick={() => setShowButtons(!showButtons)}
            aria-expanded={showButtons}
            aria-label="Toggle additional options"
            className={`p-2 flex items-center rounded-full z-60 ${isAuthed}? "opacity-100 cursor-pointer":"opacity-50 cursor-not-allowed"`}
          >
            <PlusCircledIcon className="h-8 w-8 bg-primary rounded-full border-2 border-primary" />
          </button>

          <div
            ref={menuRef}
            className={`transition-all duration-300 flex flex-col items-center left-1/2 absolute bottom-full space-y-1 transform -translate-x-1/2 ${
              showButtons ? "opacity-100 z-70" : "opacity-0 -z-10"
            }`}
            aria-hidden={!showButtons}
          >
            <Link href={`/dashboard/${account}/upload`} legacyBehavior passHref>
              <a
                aria-label="Upload"
                className={`p-2 rounded-full bg-primary border-6 border-primary ${
                  isAuthed ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                aria-disabled={!isAuthed}
              >
                <UploadIcon className="h-6 w-6" />
              </a>
            </Link>

            <Link href={`/dashboard/${account}/live`} legacyBehavior passHref>
              <a
                aria-label="Go Live"
                className={`p-2 rounded-full bg-primary border-6 border-primary  ${
                  isAuthed ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                aria-disabled={!isAuthed}
              >
                <svg
                  className="h-6 w-6 "
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 8L16 12L22 16V8Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </div> */}
    </nav>
  );
}

export default NavigationBase;
