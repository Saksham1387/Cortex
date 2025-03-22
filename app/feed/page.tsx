import { Feed } from "@/components/feed/Feed";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { FollowOptions } from "@/components/feed/FollowOptions";
import { Separator } from "@/Components/ui/separator";
import { authOptions } from "@/lib/auth";
import { getAllUsers, getUserFeed } from "@/lib/db";
import { getServerSession } from "next-auth";

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

export default async function FeedHome() {
  const session = await getServerSession(authOptions);
  const feedResponse = await getUserFeed(session?.user?.id!);
  const feedItems = feedResponse?.data as FeedItem[] || [];
  const users = await getAllUsers(session?.user.id!);

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
    <div className="pt-24 container mx-auto p-4 font-serif">
        <FeedHeader/>
        <FollowOptions users={users}/>
        <Separator/>
        <Feed allProducts={allProducts}  />
    </div>
  );
}
