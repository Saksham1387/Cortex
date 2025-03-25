const MessageSkeleton = () => (
    <div className="items-center flex justify-center mt-3 animate-pulse w-full">
      <div className="py-5 border-b max-w-5xl w-full p-5">
        <div className="flex space-x-5 pt-5 mx-auto">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const ProductsSkeleton = () => (
    <div className="items-center flex justify-center mt-8 animate-pulse w-full">
      <div className="max-w-5xl w-full p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-300 rounded-lg overflow-hidden">
              <div className="aspect-square bg-white"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  export { MessageSkeleton, ProductsSkeleton };
  