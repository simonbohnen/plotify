import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Plotify",
  description:
    "Plotify is a tool that allows you to create beautiful artwork using AI-powered templates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={cn(GeistSans.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
