import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Props = {
  message: DocumentData;
};

const Message = ({ message }: Props) => {
  const isGPT = message.user.name === "SpaceGPT";
  const router = useRouter();
  const formatPrice = (price: string) => {
    return price;
  };

  console.log("data", message);
  return (
    <div className="items-center flex justify-center mt-3 w-full">
      <div
        className={`py-5 text-white ${
          !isGPT && "bg-[#434654]"
        } rounded-xl max-w-[700px] w-full p-5`}
      >
        <div className="flex space-x-5 pt-5 max-w-2xl mx-auto">
          <img
            src={message.user.avatar}
            alt=""
            className="h-8 w-8 rounded-full"
          />
          <div className="w-full">
            <div className="pt-3 text-sm leading-relaxed">
              {(() => {
                if (!message.text) return null;

                // Get the content
                const content = message.text;

                // Check if it's a recommendation message with formatting patterns
                if (content.includes("***")) {
                  // Parse the message structure more intelligently
                  // Find introduction - everything before the first product
                  const introEndIndex = content.indexOf("***");
                  const intro = content.substring(0, introEndIndex).trim();

                  // Find all product sections (they start with ***)
                  const regex = /\*\*\*(.*?):(.*?)(?=\*\*\*|$)/gs;
                  const matches = [...content.matchAll(regex)];

                  // Find conclusion - everything after the last product that isn't a product description
                  const lastProductEnd =
                    matches.length > 0
                      ? content.lastIndexOf(matches[matches.length - 1][0]) +
                        matches[matches.length - 1][0].length
                      : introEndIndex;
                  const conclusion = content
                    .substring(lastProductEnd)
                    .replace(/^\s*\*\s*/, "")
                    .trim();

                  return (
                    <div className="space-y-4">
                      {/* Introduction */}
                      <p className="text-white">{intro}</p>

                      {/* Product recommendations */}
                      <div className="space-y-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        {matches.map((match, idx) => {
                          const productName = match[1].trim();
                          const productDesc = match[2].trim();

                          return (
                            <div
                              key={idx}
                              className="pb-2 border-b border-gray-700 last:border-0 last:pb-0"
                            >
                              <div className="font-bold text-blue-300">
                                {productName}
                              </div>
                              <div className="text-gray-300 pl-2 mt-1">
                                {productDesc}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Conclusion */}
                      {conclusion && (
                        <p className="text-gray-300 italic">{conclusion}</p>
                      )}
                    </div>
                  );
                }

                // Default handling if no special formatting is needed
                return <p className="whitespace-pre-line">{content}</p>;
              })()}
            </div>

            {isGPT && message.products && (
              <div className="mt-4">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">
                      Recommended Products
                    </h2>
                    <div className="relative">
                      <select className="appearance-none bg-white text-gray-800 py-1 px-3 pr-8 rounded border border-gray-300 focus:outline-none">
                        <option>Sort results by</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {message.products.map((product: any, index: number) => {
                      const imageUrl =
                        product.product_images_y &&
                        product.product_images_y.length > 0
                          ? product.product_images_y[0].match(
                              /https?:\/\/[^'"\s]+/g
                            )?.[0] || ""
                          : "";

                      return (
                        <div
                          key={index}
                          className="bg-white text-gray-900 rounded-lg overflow-hidden"
                        >
                          <div className="relative h-64 bg-gray-200">
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt={product.product_name_y || "Product image"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-xs text-gray-500">
                              {product.brand_name || ""}
                            </div>
                            <h3 className="font-medium text-sm mt-1 line-clamp-2 h-10">
                              {product.product_name_y || "Product Name"}
                            </h3>
                            <div className="mt-2 font-semibold">
                              $ {formatPrice(product.product_price_y || "0")}
                            </div>
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  router.push(product.product_url_y);
                                }}
                                className="w-full text-sm text-center text-blue-600 hover:underline"
                              >
                                Click for details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
