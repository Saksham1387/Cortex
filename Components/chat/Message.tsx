"use client";
import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Props = {
  messageId?: string;
  message?: DocumentData;
};

type SortOption = "default" | "low-to-high" | "high-to-low";
type ViewOption = "reranked" | "original" | "compare";
type DisplayMode = "tabs" | "sideBySide";

type TLikedProduct = {
  product_id: string;
  thumbnail: string;
  product_link: string;
  title: string;
  price: string;
};

const MessageMarkdownRenderer = ({
  messageId,
  message: initialMessage,
}: Props) => {
  const [message, setMessage] = useState<DocumentData | null>(
    initialMessage || null
  );
  const [loading, setLoading] = useState(!initialMessage && !!messageId);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(8);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [viewOption, setViewOption] = useState<ViewOption>("reranked");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("tabs");
  const [sortedProducts, setSortedProducts] = useState<any[]>([]);
  const [sortedOriginalProducts, setSortedOriginalProducts] = useState<any[]>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  const router = useRouter();

  const loadMore = useCallback(() => {
    setDisplayCount((prevCount) => prevCount + 8);
  }, []);

  useEffect(() => {
    if (messageId && !initialMessage) {
      const fetchMessage = async () => {
        try {
          setLoading(true);

          const db = getFirestore();
          const messageRef = doc(db, "messages", messageId);
          const messageSnap = await getDoc(messageRef);

          if (messageSnap.exists()) {
            setMessage(messageSnap.data());
          } else {
            setError("Message not found");
          }
        } catch (err) {
          console.error("Error fetching message:", err);
          setError("Failed to load message");
        } finally {
          setLoading(false);
        }
      };

      fetchMessage();
    }
  }, [messageId, initialMessage]);

  // Sort both products and originalProducts
  useEffect(() => {
    if (message?.products) {
      const products = [...message.products];
      setSortedProducts(sortProductsByPrice(products, sortOption));
    }
    
    if (message?.originalProducts) {
      const originalProducts = [...message.originalProducts];
      setSortedOriginalProducts(sortProductsByPrice(originalProducts, sortOption));
    }
  }, [message, sortOption]);

  const sortProductsByPrice = (products: any[], sortOption: SortOption) => {
    const parsePrice = (priceStr: string) => {
      if (!priceStr) return 0;
      const numericPrice = parseFloat(priceStr.replace(/[$,£€]/g, ""));
      return isNaN(numericPrice) ? 0 : numericPrice;
    };

    const sortedProducts = [...products];
    
    if (sortOption === "low-to-high") {
      sortedProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortOption === "high-to-low") {
      sortedProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    
    return sortedProducts;
  };

  // Find position change between original and reranked products
  const findPositionChange = (product: any) => {
    if (!message?.originalProducts || !message?.products) return 0;
    
    const getProductIdentifier = (p: any) => p.product_link || p.link || p.title;
    const productId = getProductIdentifier(product);
    
    const originalIndex = message.originalProducts.findIndex(
      (p: any) => getProductIdentifier(p) === productId
    );
    const rerankedIndex = message.products.findIndex(
      (p: any) => getProductIdentifier(p) === productId
    );
    
    if (originalIndex === -1 || rerankedIndex === -1) return 0;
    return originalIndex - rerankedIndex;
  };

  const handleLike = async (product: any) => {
    try {
      const productId = product.id || `product-${Date.now()}`;

      // Prepare the data to be sent to the API
      const likedProduct: TLikedProduct = {
        product_id: productId,
        thumbnail: product.thumbnail || "",
        product_link: product.product_link || product.link || "",
        title: product.title || "",
        price: product.price || "",
      };

      // Make the API call
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(likedProduct),
      });

      if (response) {
        toast("Liked!", {});
        // Update local state to reflect the liked status
        setLikedProducts(prev => [...prev, productId]);
      } else {
        console.error("Failed to like product");
      }
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading message...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!message) {
    return <div className="p-4">No message data available</div>;
  }

  const isGPT = message.user?.name === "SpaceGPT" || message.user?._id === "CortexQ";
  const hasMoreProducts = sortedProducts && displayCount < sortedProducts.length;
  const hasMoreOriginalProducts = sortedOriginalProducts && displayCount < sortedOriginalProducts.length;
  const hasOriginalProducts = message.originalProducts && message.originalProducts.length > 0;
  const hasRerankedProducts = message.products && message.products.length > 0;
  const hasProductComparisonAvailable = hasOriginalProducts && hasRerankedProducts;

  const getSortLabel = () => {
    switch (sortOption) {
      case "low-to-high":
        return "Price: Low to High";
      case "high-to-low":
        return "Price: High to Low";
      default:
        return "Sort results by";
    }
  };

  const renderProductCard = (product: any, index: number, showRankChange = false) => {
    const productId = product.id || `product-${index}`;
    const isLiked = likedProducts.includes(productId);
    const positionChange = showRankChange ? findPositionChange(product) : 0;
    const productLink = product.product_link || product.link || "#";

    return (
      <div
        key={index}
        className="flex flex-col border border-gray-100 rounded-lg overflow-hidden relative"
      >
        {showRankChange && positionChange !== 0 && (
          <div className="absolute top-2 left-2 z-10 rounded-full text-xs font-medium px-2 py-1 flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: positionChange > 0 ? 'rgba(220, 252, 231, 0.95)' : 'rgba(254, 226, 226, 0.95)',
              color: positionChange > 0 ? '#166534' : '#991b1b'
            }}
          >
            {positionChange > 0 ? `↑${positionChange}` : `↓${Math.abs(positionChange)}`}
          </div>
        )}
        
        {product.score !== undefined && (
          <div className="absolute top-2 right-2 z-10 bg-blue-50 text-blue-700 rounded-full text-xs px-2 py-1 shadow-sm">
            Score: {(product.score * 100).toFixed(0)}%
          </div>
        )}

        <div className="aspect-square relative">
          <Link
            href={productLink}
            className="cursor-pointer"
            target="_blank"
          >
            {product.thumbnail && (
              <div className="w-full h-full relative rounded-xl p-2">
                <img
                  src={product.thumbnail}
                  width={100}
                  height={100}
                  alt={product.title || "Product image"}
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike(product);
                  }}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md transition-all hover:scale-110"
                  aria-label="Like product"
                >
                  <Heart
                    size={18}
                    className={`${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
                    }`}
                  />
                </button>

                {product.tag && (
                  <div className="">
                    <div className="absolute top-2 left-2 bg-gray-100 text-xs px-2 py-1 rounded-full">
                      {product.tag}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>
        <div className="p-3 bg-transparent">
          <div className="flex justify-between items-start">
            <div className="font-medium text-gray-900">
              {product.price || ""}
            </div>
            <div className="text-xs text-gray-500">
              {product.source || product.store || ""}
            </div>
          </div>
          <div className="text-sm text-gray-900 mt-1 line-clamp-2">
            {product.title || "Product Name"}
          </div>
          <div className="mt-2">
            <button
              onClick={() => {
                window.open(productLink, "_blank");
              }}
              className="w-full text-gray-500 text-xs font-medium rounded transition-colors"
            >
              Click for details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="items-center flex justify-center mt-3 w-full">
      <div className={`py-5 ${!isGPT ? "border-b" : ""} max-w-5xl w-full p-5`}>
        <div className="flex space-x-5 p-5 mx-auto">
          {/* User/Assistant icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
            {message.user?.avatar && (
              <Image
                src={message.user.avatar}
                alt=""
                width={100}
                height={100}
                className="h-full w-full object-cover border-none"
              />
            )}
          </div>

          <div className="w-full mb-">
            {/* Message text content */}
            <div className="text-sm leading-relaxed">
              {message.text ? (
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {message.text}
                </ReactMarkdown>
              ) : null}
            </div>

            {/* Product recommendations section */}
            {isGPT && (hasRerankedProducts || hasOriginalProducts) && (
              <div className="flex flex-col gap-4 mt-4">
                {/* Controls for sorting and view options */}
                <div className="flex justify-between mb-2">
                  {/* Display mode switcher - only show if we have both original and reranked */}
                  {hasProductComparisonAvailable && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs ${viewOption === "compare" ? "bg-gray-100" : ""}`}
                        onClick={() => setViewOption("compare")}
                      >
                        <ArrowUpDown className="mr-1 h-3 w-3" />
                        Compare Rankings
                      </Button>
                      
                      {viewOption === "compare" && (
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs ${displayMode === "tabs" ? "bg-gray-100" : ""}`}
                            onClick={() => setDisplayMode("tabs")}
                          >
                            Tabs
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs ${displayMode === "sideBySide" ? "bg-gray-100" : ""}`}
                            onClick={() => setDisplayMode("sideBySide")}
                          >
                            Side by Side
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Sort dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-sm font-normal"
                      >
                        {getSortLabel()}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-2"
                        >
                          <path
                            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSortOption("default")}
                      >
                        Default
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOption("low-to-high")}
                      >
                        Price: Low to High
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOption("high-to-low")}
                      >
                        Price: High to Low
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Product display based on view option */}
                {viewOption === "compare" && hasProductComparisonAvailable ? (
                  displayMode === "tabs" ? (
                    // Tabs view
                    <Tabs defaultValue="reranked" className="w-full">
                      <TabsList className="w-full flex mb-4">
                        <TabsTrigger value="reranked" className="flex-1">
                          Optimized Rankings
                        </TabsTrigger>
                        <TabsTrigger value="original" className="flex-1">
                          Original Rankings
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Reranked products tab */}
                      <TabsContent value="reranked" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {sortedProducts
                            .slice(0, displayCount)
                            .map((product, index) => 
                              renderProductCard(product, index, true)
                            )}
                        </div>
                        {hasMoreProducts && (
                          <div className="flex justify-center mt-6">
                            <Button
                              variant="outline"
                              onClick={loadMore}
                              className="px-6"
                            >
                              Load More
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Original products tab */}
                      <TabsContent value="original" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {sortedOriginalProducts
                            .slice(0, displayCount)
                            .map((product, index) => 
                              renderProductCard(product, index)
                            )}
                        </div>
                        {hasMoreOriginalProducts && (
                          <div className="flex justify-center mt-6">
                            <Button
                              variant="outline"
                              onClick={loadMore}
                              className="px-6"
                            >
                              Load More
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    // Side by side view
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original products */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4 text-center">Original Rankings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sortedOriginalProducts
                            .slice(0, Math.min(displayCount, 8))
                            .map((product, index) => 
                              renderProductCard(product, index)
                            )}
                        </div>
                        {sortedOriginalProducts.length > 8 && (
                          <div className="flex justify-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open("#", "_blank")}
                              className="px-4 text-xs"
                            >
                              See All
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Reranked products */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4 text-center">Optimized Rankings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sortedProducts
                            .slice(0, Math.min(displayCount, 8))
                            .map((product, index) => 
                              renderProductCard(product, index, true)
                            )}
                        </div>
                        {sortedProducts.length > 8 && (
                          <div className="flex justify-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open("#", "_blank")}
                              className="px-4 text-xs"
                            >
                              See All
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  // Regular product grid (default view)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(hasRerankedProducts ? sortedProducts : sortedOriginalProducts)
                      .slice(0, displayCount)
                      .map((product, index) => 
                        renderProductCard(product, index)
                      )}
                  </div>
                )}

                {/* Load more button for default view */}
                {viewOption !== "compare" && hasMoreProducts && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="px-6"
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {/* Tags at the bottom */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full">
                    CortexQ
                  </span>
                  {message.tags &&
                    message.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageMarkdownRenderer;