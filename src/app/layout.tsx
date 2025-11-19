import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Emils Tool Fabrick",
  description: "No-Code Entwickler Schaltzentrale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
