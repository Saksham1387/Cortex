"use client";
import { db } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";

export const Favorites = () => {
  const { data: session } = useSession();

  const [favItems, fetching, error] = useCollection(
    session && query(collection(db, "users", session?.user?.email!, "likes"))
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (fetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {favItems?.docs.map((doc) => {
        const product = doc.data();
        const productId = doc.id;

        return (
          <div
            key={productId}
            className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
      {favItems?.docs.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No favorite items yet
        </div>
      )}
    </div>
  );
};
