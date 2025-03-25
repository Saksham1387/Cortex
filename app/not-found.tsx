import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex space-x-4">
        <Link href="/">
          <Button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all">
            Back to Home
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant={"outline"} className="text-black px-6 py-2 rounded-lg transition-all">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}