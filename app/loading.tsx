"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }
        return prevProgress + 1
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const dots = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const dot = {
    initial: { scale: 0 },
    animate: {
      scale: [0, 1, 0],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
      },
    },
  }

  return (
    <div className="min-h-screen font-serif flex flex-col items-center justify-center bg-[#fafafa] text-center px-4">
      <motion.div className="flex flex-col items-center" variants={container} initial="hidden" animate="show">
        <motion.div className="relative mb-8" variants={item}>
          <Loader2 className="h-12 w-12 animate-spin text-black" />
          <motion.div
            className="flex space-x-2 absolute -bottom-6 left-1/2 transform -translate-x-1/2"
            variants={dots}
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="w-2 h-2 bg-black rounded-full" variants={dot} />
            ))}
          </motion.div>
        </motion.div>

        <motion.h1 className="text-4xl md:text-6xl font-bold mb-4" variants={item}>
          Loading
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            ...
          </motion.span>
        </motion.h1>

        <motion.p className="text-lg text-gray-600 max-w-2xl mb-8" variants={item}>
          Please wait while we prepare your content.
        </motion.p>

        <motion.div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2" variants={item}>
          <motion.div
            className="h-full bg-black rounded-full"
            initial={{ width: "5%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </motion.div>

        <motion.span className="text-sm text-gray-500" variants={item}>
          {progress}%
        </motion.span>
      </motion.div>
    </div>
  )
}

