"use client";
import Image from "next/image";
import { Star } from "lucide-react";

type Product = {
  title: string;
  link: string;
  source?: string;
  price: string;
  rating?: string;
  reviews?: string;
  thumbnail?: string;
  store?: string;
  score?: number;
};

type Props = {
  product: Product;
  showScore?: boolean;
};

const ProductItem = ({ product, showScore = false }: Props) => {
  return (
    <div className="min-w-[220px] w-[220px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-[280px] relative flex flex-col">
      <div className="w-full h-32 bg-gray-100 relative flex items-center justify-center p-2">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={120}
            height={120}
            className="max-h-28 object-contain"
          />
        ) : (
          <div className="h-28 w-28 bg-gray-200 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-semibold text-gray-900">{product.price}</p>
            {product.store && (
              <span className="text-xs text-gray-500 truncate max-w-[100px]">{product.store}</span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviews})
                </span>
              )}
            </div>
          )}

          {showScore && product.score !== undefined && (
            <div className="mt-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full inline-block">
              Score: {(product.score * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
      
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
        aria-label={`View ${product.title}`}
      />
    </div>
  );
};

export default ProductItem;