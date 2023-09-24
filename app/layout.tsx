import RootProvider from "./providers";
import "@/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "./(providers)/theme";
import { ToggleThemeButton } from "./(components)/theme-toggle/toggle-button";
import { AuthWrapper } from "@/(context)/AuthContext";
import ConnectWallet from "@/wallet";
import Script from "next/script";
import NavigationBase from "./(components)/navigation/navigation-base";
import Link from "next/link";
import DefaultLoader from "./(components)/loader/default-loader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://player.live-video.net/1.21.0/amazon-ivs-player.min.js" />

      <body className="relative flex flex-col  bg-center bg-repeat-y bg-[url('/bg-img.jpg')] ">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RootProvider>
            <header className="w-full flex justify-between  px-4 py-8 overflow-hidden">
              <Link href="/">
                <svg width="135" height="47" viewBox="0 0 135 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M29.375 13.7083H33.2916C35.8885 13.7083 38.3791 14.74 40.2154 16.5763C42.0517 18.4126 43.0833 20.9031 43.0833 23.5C43.0833 26.0969 42.0517 28.5875 40.2154 30.4238C38.3791 32.2601 35.8885 33.2917 33.2916 33.2917H29.375M17.625 33.2917H13.7083C11.1114 33.2917 8.62083 32.2601 6.78454 30.4238C4.94824 28.5875 3.91663 26.0969 3.91663 23.5C3.91663 20.9031 4.94824 18.4126 6.78454 16.5763C8.62083 14.74 11.1114 13.7083 13.7083 13.7083H17.625"
                    stroke="#8FFC69"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path d="M32.2838 1.95834L28.1296 6.1126" stroke="#FF00A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M15.6666 1.95834L19.8209 6.1126" stroke="#FF00A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M54.92 33V15.72H56.684V31.308H64.892V33H54.92ZM67.1778 17.58V15.6H68.9418V17.58H67.1778ZM67.1778 33V20.04H68.9418V33H67.1778ZM81.8994 33V26.388C81.8994 25.668 81.8314 25.008 81.6954 24.408C81.5594 23.8 81.3394 23.272 81.0354 22.824C80.7394 22.368 80.3514 22.016 79.8714 21.768C79.3994 21.52 78.8234 21.396 78.1434 21.396C77.5194 21.396 76.9674 21.504 76.4874 21.72C76.0154 21.936 75.6154 22.248 75.2874 22.656C74.9674 23.056 74.7234 23.544 74.5554 24.12C74.3874 24.696 74.3034 25.352 74.3034 26.088L73.0554 25.812C73.0554 24.484 73.2874 23.368 73.7514 22.464C74.2154 21.56 74.8554 20.876 75.6714 20.412C76.4874 19.948 77.4234 19.716 78.4794 19.716C79.2554 19.716 79.9314 19.836 80.5074 20.076C81.0914 20.316 81.5834 20.64 81.9834 21.048C82.3914 21.456 82.7194 21.924 82.9674 22.452C83.2154 22.972 83.3954 23.528 83.5074 24.12C83.6194 24.704 83.6754 25.288 83.6754 25.872V33H81.8994ZM72.5274 33V20.04H74.1234V23.232H74.3034V33H72.5274ZM86.7774 33L86.7894 15.72H88.5654V26.28L94.3494 20.04H96.7014L90.6294 26.52L97.4934 33H94.9254L88.5654 26.76V33H86.7774ZM105.752 33C105.024 33.152 104.304 33.212 103.592 33.18C102.888 33.148 102.256 32.996 101.696 32.724C101.144 32.452 100.724 32.028 100.436 31.452C100.204 30.972 100.076 30.488 100.052 30C100.036 29.504 100.028 28.94 100.028 28.308V16.44H101.78V28.236C101.78 28.78 101.784 29.236 101.792 29.604C101.808 29.964 101.892 30.284 102.044 30.564C102.332 31.1 102.788 31.42 103.412 31.524C104.044 31.628 104.824 31.604 105.752 31.452V33ZM97.2556 21.552V20.04H105.752V21.552H97.2556ZM108.641 33V30.948H110.693V33H108.641ZM121.455 33C120.727 33.152 120.007 33.212 119.295 33.18C118.591 33.148 117.959 32.996 117.399 32.724C116.847 32.452 116.427 32.028 116.139 31.452C115.907 30.972 115.779 30.488 115.755 30C115.739 29.504 115.731 28.94 115.731 28.308V16.44H117.483V28.236C117.483 28.78 117.487 29.236 117.495 29.604C117.511 29.964 117.595 30.284 117.747 30.564C118.035 31.1 118.491 31.42 119.115 31.524C119.747 31.628 120.527 31.604 121.455 31.452V33ZM112.959 21.552V20.04H121.455V21.552H112.959ZM127.512 33L122.808 20.04H124.596L128.424 30.696L132.228 20.04H134.04L129.336 33H127.512Z"
                    fill="white"
                  />
                </svg>
              </Link>

              <div className="flex items-center space-x-2">
                <ToggleThemeButton />
                <ConnectWallet />
              </div>
            </header>
            <AuthWrapper>
              <main className="flex-1 grid grid-cols-1  mx-auto max-w-xl p-4 pb-20  overflow-y-auto">{children}</main>

              <NavigationBase />
            </AuthWrapper>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
