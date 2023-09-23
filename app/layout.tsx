import RootProvider from "./providers";
import "@/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "./(providers)/theme";
import { ToggleThemeButton } from "./(components)/theme-toggle/toggle-button";
import { AuthWrapper } from "@/(context)/AuthContext";
import ConnectWallet from "@/wallet";
import Script from "next/script";
import NavigationBase from "./(components)/navigation/navigation-base";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://player.live-video.net/1.21.0/amazon-ivs-player.min.js" />

      <body className="relative flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RootProvider>
            <header className="w-full flex justify-between  px-2 py-8 overflow-hidden">
              <ToggleThemeButton />
              <ConnectWallet />
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
