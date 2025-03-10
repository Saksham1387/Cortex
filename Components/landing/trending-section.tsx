"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";

type Titem = {
  product_id: string;
  thumbnail: string;
  title: string;
  price: number;
  old_price: number;
  tag: string;
  source: string;
};

export function TrendingSection() {
  const [trendingItems, setTrendingItems] = useState<Titem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/trending");
      if (res.data && res.data.data) {
        setTrendingItems(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching trending items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!trendingItems.length) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingItems, currentIndex]);

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.offsetWidth,
        behavior: "smooth",
      });

      setCurrentIndex((prev) => {
        const newIndex = prev === 0 ? trendingItems.length - 1 : prev - 1;
        return newIndex;
      });
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.offsetWidth,
        behavior: "smooth",
      });

      setCurrentIndex((prev) => {
        const newIndex = prev === trendingItems.length - 1 ? 0 : prev + 1;
        return newIndex;
      });
    }
  };

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const itemElement = container.querySelector(
      ".item-card"
    ) as HTMLElement | null;
    const itemWidth = itemElement?.offsetWidth || 0;
    const gap = 20;

    container.scrollTo({
      left: index * (itemWidth + gap),
      behavior: "smooth",
    });

    setCurrentIndex(index);
  };

  return (
    <section className="max-w-[1000px] mx-auto px-4 sm:px-6 mb-16 ">
      <h2 className="text-xl mb-8 font-gascogne font-normal leading-6 text-zinc-950">
        Trending this Week
      </h2>
      <div className="relative group rounded-xl">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10 border"
          aria-label="Previous items"
          disabled={loading}
        >
          <IoIosArrowRoundBack className="h-6 w-6" />
        </button>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-5 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {trendingItems.slice(0, 15).map((item, index) => (
              <div
                key={item.product_id || index}
                className="snap-start item-card"
              >
                <div className="aspect-square relative mb-3 bg-gray-50 overflow-hidden group rounded-xl w-full max-w-[200px]">
                  <Image
                    src={
                      item.thumbnail || "/placeholder.svg?height=400&width=400"
                    }
                    alt={item.title || "Trending product"}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col max-w-[200px]">
                  <h3 className="text-xs text-gray-700 line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleNext}
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-white flex items-center justify-center z-10"
          aria-label="Next items"
          disabled={loading}
        >
          <IoIosArrowRoundForward className="h-6 w-6" />
        </button>
      </div>

      {/* Indicators */}

      <div className="flex justify-center gap-1.5 mt-6">
        {trendingItems
          .slice(0, Math.min(10, trendingItems.length))
          .map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full ${
                i === currentIndex
                  ? "w-6 bg-gray-800"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
      </div>
    </section>
  );
}
