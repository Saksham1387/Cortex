import { authOptions } from "@/lib/auth";
import { getUserFeed } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TLikedProduct = {
  id: string;
  product_id: string;
  thumbnail: string;
  product_link: string;
  title: string;
  price: string;
};

type FeedItem = {
  userId: string;
  userEmail: string;
  userName: string | null;
  products: TLikedProduct[];
};

export default async function Feed() {
  const session = await getServerSession(authOptions);
  const feedResponse = await getUserFeed(session?.user?.id!);
  const feedItems = feedResponse?.data as FeedItem[] || [];
  console.log(feedResponse)
  // Flatten all products from all users into a single array
  const allProducts = feedItems.flatMap(item => 
    item.products.map(product => ({
      product,
      user: {
        id: item.userId,
        name: item.userName || item.userEmail,
        email: item.userEmail
      }
    }))
  );

  if (!allProducts.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Your feed is empty</h2>
        <p className="text-gray-500">
          Follow more users to see products they like
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-28 font-serif">
      <h1 className="text-2xl font-semibold mb-6">Your Feed</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {allProducts.map((item) => (
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
              {/* <div className="mt-2">
                <button
                  onClick={() => {
                    window.open(item.product.product_link, "_blank");
                  }}
                  className="w-full py-1 text-gray-500 hover:text-gray-700 text-xs font-medium rounded transition-colors"
                >
                  Click for details
                </button>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}