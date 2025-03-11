// "use client"
// import { DocumentData } from "firebase/firestore";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import ReactMarkdown from 'react-markdown';
// import rehypeRaw from "rehype-raw";

// type Props = {
//   message: DocumentData;
// };

// const Message = ({ message }: Props) => {
//   const isGPT = message.user.name === "SpaceGPT";

//   console.log("----",message)
//   return (
//     <div className="items-center flex justify-center mt-3 w-full">
//       <div className={`py-5 ${!isGPT ? "border-b" : ""}  max-w-5xl w-full p-5`}>
//         <div className="flex space-x-5 pt-5 mx-auto">
//           {/* User/Assistant icon */}
//           <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
//             <img
//               src={message.user.avatar}
//               alt=""
//               className="h-full w-full object-cover border-none"
//             />
//           </div>

//           <div className="w-full">
//             {/* Message text content */}
//             <div className="pt-3 text-sm leading-relaxed">
//               {(() => {
//                 if (!message.text) return null;

//                 // Get the content
//                 const content = message.text;

//                 // Check if it's a recommendation message with formatting patterns
//                 if (content.includes("***")) {
//                   // Parse the message structure more intelligently
//                   // Find introduction - everything before the first product
//                   const introEndIndex = content.indexOf("***");
//                   const intro = content.substring(0, introEndIndex).trim();

//                   // Find all product sections (they start with ***)
//                   const regex = /\*\*\*(.*?):(.*?)(?=\*\*\*|$)/gs;
//                   const matches = [...content.matchAll(regex)];

//                   // Find conclusion - everything after the last product that isn't a product description
//                   const lastProductEnd =
//                     matches.length > 0
//                       ? content.lastIndexOf(matches[matches.length - 1][0]) +
//                         matches[matches.length - 1][0].length
//                       : introEndIndex;
//                   const conclusion = content
//                     .substring(lastProductEnd)
//                     .replace(/^\s*\*\s*/, "")
//                     .trim();

                   
//                   return (
//                     <div className="flex flex-col gap-4">
//                       {/* Introduction */}
//                       <p
//                         className={`${!isGPT ? "text-white" : "text-gray-800"}`}
//                       >
//                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.text}</ReactMarkdown>
//                       </p>

//                       {/* Product recommendations */}
//                       <div
//                         className={`space-y-3 px-4 py-3 ${
//                           !isGPT ? " border-gray-700" : " border-gray-200"
//                         } rounded-lg border`}
//                       >
//                         {matches.map((match, idx) => {
//                           const productName = match[1].trim();
//                           const productDesc = match[2].trim();

//                           return (
//                             <div
//                               key={idx}
//                               className={`pb-2 border-b ${
//                                 !isGPT ? "border-gray-700" : "border-gray-200"
//                               } last:border-0 last:pb-0`}
//                             >
//                               <div
//                                 className={`font-bold ${
//                                   !isGPT ? "text-blue-300" : "text-blue-600"
//                                 }`}
//                               >
//                                 {productName}
//                               </div>
//                               <div
//                                 className={`${
//                                   !isGPT ? "text-gray-300" : "text-gray-600"
//                                 } pl-2 mt-1`}
//                               >
//                                 {productDesc}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>

//                       {/* Conclusion */}
//                       {conclusion && (
//                         <p
//                           className={`italic ${
//                             !isGPT ? "text-gray-300" : "text-gray-500"
//                           }`}
//                         >
//                           {conclusion}
//                         </p>
//                       )}
//                     </div>
//                   );
//                 }

//                 // Default handling if no special formatting is needed
//                 return <p className="whitespace-pre-line">{content}</p>;
//               })()}
//             </div>

//             {/* Product recommendations section */}
//             {isGPT && message.products && message.products.length > 0 && (
//               <div className="flex flex-col gap-4 mt-4">
//                 {/* Sort dropdown */}
//                 <div className="flex justify-end mb-2">
//                   <Button
//                     variant="outline"
//                     className="flex items-center gap-2 text-sm font-normal"
//                   >
//                     Sort results by
//                     <svg
//                       width="12"
//                       height="12"
//                       viewBox="0 0 15 15"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="ml-2"
//                     >
//                       <path
//                         d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
//                         fill="currentColor"
//                         fillRule="evenodd"
//                         clipRule="evenodd"
//                       ></path>
//                     </svg>
//                   </Button>
//                 </div>

//                 {/* Product grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {message.products
//                     .slice(0, 8)
//                     .map((product: any, index: number) => (
//                       <div
//                         key={index}
//                         className="flex flex-col border-none rounded-lg overflow-hidden "
//                       >
//                         <div className="aspect-square relative">
//                           {product.thumbnail && (
//                             <div className="w-full h-full relative rounded-xl p-2">
//                               <Image
//                                 src={product.thumbnail}
//                                 width={100}
//                                 height={100}
//                                 alt={product.title || "Product image"}
//                                 className="w-full h-full object-cover rounded-xl"
//                               />

//                               {product.tag && (
//                                 <div className="">
//                                   <div className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded-full ">
//                                     {product.tag}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                         <div className="p-3 bg-transparent">
//                           <div className="flex justify-between items-start">
//                             <div className="font-medium text-gray-900">
//                               {product.price || ""}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {product.source || ""}
//                             </div>
//                           </div>
//                           <div className="text-sm text-gray-900 mt-1 line-clamp-2">
//                             {product.title || "Product Name"}
//                           </div>
//                           <div className="mt-2">
//                             <button
//                               onClick={() => {
//                                 window.open(product.product_link, "_blank");
//                               }}
//                               className="w-ful text-gray-500 text-xs font-medium rounded transition-colors"
//                             >
//                               Click for details
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                 </div>

//                 {/* Tags at the bottom */}
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full">
//                     Cortex
//                   </span>
//                   {message.tags &&
//                     message.tags.map((tag: string, index: number) => (
//                       <span
//                         key={index}
//                         className="text-xs bg-gray-100 px-3 py-1.5 rounded-full"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Message;

"use client"
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Firebase imports
import { getFirestore, doc, getDoc, DocumentData } from 'firebase/firestore';

type Props = {
  messageId?: string;
  message?: DocumentData;
};

const MessageMarkdownRenderer = ({ messageId, message: initialMessage }: Props) => {
  const [message, setMessage] = useState<DocumentData | null>(initialMessage || null);
  const [loading, setLoading] = useState(!initialMessage && !!messageId);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    // Only fetch if we have a messageId but no initial message
    if (messageId && !initialMessage) {
      const fetchMessage = async () => {
        try {
          setLoading(true);
          
          const db = getFirestore();
          const messageRef = doc(db, 'messages', messageId);
          const messageSnap = await getDoc(messageRef);
          
          if (messageSnap.exists()) {
            setMessage(messageSnap.data());
          } else {
            setError('Message not found');
          }
        } catch (err) {
          console.error('Error fetching message:', err);
          setError('Failed to load message');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessage();
    }
  }, [messageId, initialMessage]);
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading message...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }
  
  if (!message) {
    return <div className="p-4">No message data available</div>;
  }

  const isGPT = message.user?.name === "SpaceGPT";
  
  return (
    <div className="items-center flex justify-center mt-3 w-full">
      <div className={`py-5 ${!isGPT ? "border-b" : ""} max-w-5xl w-full p-5`}>
        <div className="flex space-x-5 pt-5 mx-auto">
          {/* User/Assistant icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
            {message.user?.avatar && (
              <img
                src={message.user.avatar}
                alt=""
                className="h-full w-full object-cover border-none"
              />
            )}
          </div>

          <div className="w-full">
            {/* Message text content */}
            <div className="pt-3 text-sm leading-relaxed">
              {message.text ? (
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {message.text}
                </ReactMarkdown>
              ) : null}
            </div>

            {/* Product recommendations section */}
            {isGPT && message.products && message.products.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                {/* Sort dropdown */}
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-sm font-normal"
                  >
                    Sort results by
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
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {message.products
                    .slice(0, 8)
                    .map((product: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col border-none rounded-lg overflow-hidden"
                      >
                        <div className="aspect-square relative">
                          {product.thumbnail && (
                            <div className="w-full h-full relative rounded-xl p-2">
                              <Image
                                src={product.thumbnail}
                                width={100}
                                height={100}
                                alt={product.title || "Product image"}
                                className="w-full h-full object-cover rounded-xl"
                              />

                              {product.tag && (
                                <div className="">
                                  <div className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded-full">
                                    {product.tag}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-transparent">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-gray-900">
                              {product.price || ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.source || ""}
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
                              className="w-full text-gray-500 text-xs font-medium rounded transition-colors"
                            >
                              Click for details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Tags at the bottom */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full">
                    Cortex
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