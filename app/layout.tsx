import React from "react";

export const metadata = {
  title: "Show Budget App",
  description: "Simple show budget app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
