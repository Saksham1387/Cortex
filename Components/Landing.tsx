import { SearchBar } from "@/components/landing/search-bar";
import { TrendingSection } from "@/components/landing/trending-section";
import { QuickLinks } from "@/components/landing/quick-links";
import { Greeting } from "./Greetings";
import TypewriterEffect from "./landing/typewriter-effect";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <main className="flex-1 container mx-auto px-4 py-8 pt-36 ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2"></div>
        </div>
        <div className="flex flex-col items-center justify-center max-w-3xl mx-auto mt-20 mb-16">
          <h1 className="text-3xl md:text-5xl text-center mb-2">
            <Greeting /> What can I help you find?
          </h1>
          <div className="py-3">
            <TypewriterEffect
              words={[
                "Find unique deals, sustainably",
                "A treasure hunt, just a click away",
                "Rare finds. Great prices. One search",
                "Shop smarter, shop secondhand",
                "Hidden gems, waiting for you",
                "Swipe, shop, and save effortlessly",
                "One search, endless possibilities",
                "Software Engineer",
                "Pre-loved, re-loved—just for you.",
              ]}
            />
          </div>
          <SearchBar />
          <QuickLinks />
        </div>
        <div className="mt-28">
          <TrendingSection />
        </div>
      </main>
    </div>
  );
}
