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
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f4f4f5" }}>
        {children}
      </body>
    </html>
  );
}
