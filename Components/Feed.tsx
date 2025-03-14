"use client"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";

export const Feed = (allProducts:any) => {
    console.log('allProducts', allProducts)

    return (
        <div className="container mx-auto p-4 pt-28 font-serif">
      <h1 className="text-2xl font-semibold mb-6">Your Feed</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {allProducts.allProducts.map((item:any) => (
          <div
            key={item.product.id}
            className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="aspect-square relative">
              <Link
                href={item.product.product_link || "#"}
                className="cursor-pointer"
              >
                {item.product.thumbnail && (
                  <div className="w-full h-full relative rounded-2xl p-2">
                    <img
                      src={item.product.thumbnail}
                      width={100}
                      height={100}
                      alt={item.product.title || "Product image"}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                )}
              </Link>
            </div>
            <div className="p-3 bg-white">
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-900">
                  {item.product.price || ""}
                </div>
                
                {/* User Avatar */}
                <Avatar className="h-6 w-6">
                  {/* <AvatarImage src={} /> */}
                  <AvatarFallback>
                    {item.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-sm text-gray-900 mt-1 line-clamp-2">
                {item.product.title || "Product Name"}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    redirect(item.product.product_link);
                  }}
                  className="w-full py-1 text-gray-500 hover:text-gray-700 text-xs font-medium rounded transition-colors"
                >
                  Click for details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    )
};
