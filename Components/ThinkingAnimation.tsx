import Image from "next/image";
import React, { useState, useEffect } from "react";

const TypingAnimation = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex max-w-4xl mx-auto  items-center justify-start">
      <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src="https://gold-legislative-tuna-190.mypinata.cloud/ipfs/bafkreig4sc5zimeoqftn3i6danbeeoxegywjznhpzkmhqe4mwnd356rjhq"
          width={100}
          height={100}
          alt="cortex"
          className="h-full w-full object-cover border-none"
        />
      </div>
      <div className="rounded-lg p-3 max-w-md">
        <p className="text-gray-500 font-medium">
          Thinking{dots}
          <span className="invisible">...</span>
        </p>
      </div>
    </div>
  );
};

export default TypingAnimation;
