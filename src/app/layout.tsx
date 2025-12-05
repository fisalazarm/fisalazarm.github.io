import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChillSpace",
  description: "Pomodoro app to help you focus and relax.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
