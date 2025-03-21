"use client";
import { db } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

interface FavoritesProps {
  userEmail: string;
}

export const Favorites = ({ userEmail }: FavoritesProps) => {
  const { data: session } = useSession();
  const [sortOption, setSortOption] = useState("recent");

  const [favItems, fetching, error] = useCollection(
    session &&
      query(
        collection(
          db,
          "users",
          userEmail ? userEmail : session?.user?.email!,
          "likes"
        )
      )
  );

  const sortedItems = useMemo(() => {
    if (!favItems) return [];

    const items = [...favItems.docs];

    switch (sortOption) {
      case "price-low":
        return items.sort((a, b) => {
          const priceA = parseFloat(
            a.data().price?.replace(/[^0-9.]/g, "") || 0
          );
          const priceB = parseFloat(
            b.data().price?.replace(/[^0-9.]/g, "") || 0
          );
          return priceA - priceB;
        });

      case "price-high":
        return items.sort((a, b) => {
          const priceA = parseFloat(
            a.data().price?.replace(/[^0-9.]/g, "") || 0
          );
          const priceB = parseFloat(
            b.data().price?.replace(/[^0-9.]/g, "") || 0
          );
          return priceB - priceA;
        });

      case "recent":
      default:
        return items.sort((a, b) => {
          const timestampA = a.data().timestamp?.toMillis() || 0;
          const timestampB = b.data().timestamp?.toMillis() || 0;
          return timestampB - timestampA;
        });
    }
  }, [favItems, sortOption]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (fetching) {
    return <div>Loading...</div>;
  }

  const itemCount = sortedItems?.length || 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">{itemCount} items</h2>
        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort results by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {sortedItems.map((doc) => {
          const product = doc.data();
          const productId = doc.id;

          return (
            <div
              key={productId}
              className="flex flex-col rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative">
                <Link
                  href={product.product_link || "#"}
                  className="cursor-pointer"
                >
                  {product.thumbnail && (
                    <div className="w-full h-full relative rounded-2xl p-2">
                      <img
                        src={product.thumbnail}
                        width={100}
                        height={100}
                        alt={product.title || "Product image"}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  )}
                </Link>
              </div>
              <div className="p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-900">
                    {product.price || ""}
                  </div>
                </div>
                <div className="text-sm text-gray-900 mt-1 line-clamp-2">
                  {product.title || "Product Name"}
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      window.open(product.product_link, "_blank");
                    }}
                    className="w-full py-1 text-gray-500 hover:text-gray-700 text-xs font-medium rounded transition-colors"
                  >
                    Click for details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {sortedItems.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No favorite items yet
          </div>
        )}
      </div>
    </div>
  );
};
