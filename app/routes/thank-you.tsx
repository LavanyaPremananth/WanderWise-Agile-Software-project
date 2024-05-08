import { Footer } from "~/lib/ui/Footer";
import { Nav } from "~/lib/ui/Nav";

export default function ThankYou() {
  return (
    <div>
      <Nav />

      <div className="flex flex-col items-center">
        <h1 className="mb-8 mt-8 max-w-4xl text-center text-4xl text-teal-900">
          Your booking has been submitted. Please wait for confirmation from the
          hotel.
        </h1>

        <a href="/" className="text-center text-teal-500">
          Back to home
        </a>
      </div>

      <Footer />
    </div>
  );
}
