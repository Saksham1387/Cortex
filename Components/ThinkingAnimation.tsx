"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  // Variants for the dots animation
  const dotsContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex max-w-4xl mx-auto items-center justify-start p-4 bg-white">
      <motion.div className="relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ">
        <div className="absolute inset-0 bg-white opacity-30 " />
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full  overflow-hidden">
          <Image
            src="https://gold-legislative-tuna-190.mypinata.cloud/ipfs/bafkreig4sc5zimeoqftn3i6danbeeoxegywjznhpzkmhqe4mwnd356rjhq"
            width={100}
            height={100}
            alt="cortex"
            className="h-full w-full object-cover border-none bg-white"
          />
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 mix-blend-overlay"
          initial="initial"
          animate="animate"
        />
      </motion.div>

      <div className="ml-3 bg-white dark:to-slate-900 rounded-2xl p-4">
        <div className="flex items-center">
          <motion.span
            className="text-black dark:text-slate-200 font-medium"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            Thinking
          </motion.span>

          <div className="flex ml-1 space-x-0.5 h-5 overflow-hidden">
            <motion.div
              variants={dotsContainerVariants}
              initial="initial"
              animate="animate"
              className="flex"
            >
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className={`text-slate-700 dark:text-slate-200 ${
                    dots.length > index ? "opacity-100" : "opacity-0"
                  }`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{
                    y: dots.length > index ? 0 : 10,
                    opacity: dots.length > index ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  .
                </motion.span>
              ))}
            </motion.div>
            <span className="invisible">...</span>
          </div>
        </div>

        <motion.div
          className="mt-1 h-0.5 bg-gradient-to-r from-gray-500 to-stone-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

export default TypingAnimation;
