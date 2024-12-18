import Header from "./components/Header";
import "./global.css";

export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto p-10 flex-grow">{children}</main>
        <footer className="footer footer-center bg-base-300 text-base-content p-4">
          <aside>
            <p>
              Copyright © {new Date().getFullYear()} - All right reserved by
              ACME Industries Ltd
            </p>
          </aside>
        </footer>
      </body>
    </html>
  );
}
