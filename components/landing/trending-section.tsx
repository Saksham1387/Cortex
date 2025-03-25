"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import Link from "next/link";

type Titem = {
  product_id: string;
  thumbnail: string;
  title: string;
  price: number;
  old_price: number;
  tag: string;
  source: string;
  product_link: string;
};

interface TrendingSectionProps {
  trendingItems: Titem[];
}

export function TrendingSection({ trendingItems }: TrendingSectionProps) {
  // const [trendingItems, setTrendingItems] = useState<Titem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.offsetWidth,
        behavior: "smooth",
      });
      setCurrentIndex((prev) =>
        prev === 0 ? trendingItems.length - 1 : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.offsetWidth,
        behavior: "smooth",
      });
      setCurrentIndex((prev) =>
        prev === trendingItems.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <section className="max-w-[1000px] mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-xl mb-8 font-gascogne font-normal leading-6 text-zinc-950">
        Trending this Week
      </h2>
      <div className="relative group rounded-xl">
        <button
          onClick={handlePrev}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10 border"
          aria-label="Previous items"
          disabled={loading}
        >
          <IoIosArrowRoundBack className="h-6 w-6" />
        </button>

        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-5 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
        >
          {trendingItems.slice(0, 15).map((item, index) => (
            <Link href={item.product_link} key={item.product_id || index}>
              <div
                className="snap-start item-card"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`aspect-square relative mb-3 bg-gray-50 overflow-hidden group rounded-xl w-full max-w-[200px] transition-transform duration-300 ${
                    hoveredIndex === index ? "scale-110" : "scale-100"
                  }`}
                >
                  <Image
                    src={
                      item.thumbnail || "/placeholder.svg?height=400&width=400"
                    }
                    alt={item.title || "Trending product"}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col max-w-[200px]">
                  <h3 className="text-xs text-gray-700 line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-white flex items-center justify-center z-10"
          aria-label="Next items"
          disabled={loading}
        >
          <IoIosArrowRoundForward className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
