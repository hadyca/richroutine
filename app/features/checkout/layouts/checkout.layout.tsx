import { Link, Outlet } from "react-router";

import Footer from "~/core/components/footer";

export default function CheckoutLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Checkout Navbar */}
      <nav
        className={
          "mx-auto flex h-16 w-full items-center justify-between border-b px-5 shadow-xs backdrop-blur-lg transition-opacity md:px-10"
        }
      >
        <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between py-3">
          {/* Application logo/title with link to home */}
          <Link to="/">
            <h1 className="text-lg font-extrabold">RichRoutine</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto my-10 w-full max-w-screen-2xl px-5 md:my-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
