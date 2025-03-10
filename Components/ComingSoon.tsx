import { Button } from "./ui/button";

export default function ComingSoon() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        <div className="flex space-x-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 "
          />
          <Button variant={"outline"} className=" text-black px-6 py-2 rounded-lg transition-all">
            Notify Me
          </Button>
        </div>
      </div>
    );
  }
  