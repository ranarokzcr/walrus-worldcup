import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "FIFA World Cup 2026",
  description: "Predict. Support. Remember.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@500;700&family=Orbitron:wght@700;900&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" async></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
