"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TypewriterEffectProps {
  words: string[]
  delay?: number
  infinite?: boolean
}

export default function TypewriterEffect({ words, delay = 2000, infinite = true }: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100
    const currentWord = words[currentWordIndex]

    const timeout = setTimeout(() => {
      // If deleting, remove a character
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
      } else {
        // If typing, add a character
        setCurrentText(currentWord.substring(0, currentText.length + 1))
      }

      // If we've completed typing the word
      if (!isDeleting && currentText === currentWord) {
        // Wait before starting to delete
        setTimeout(() => setIsDeleting(true), delay)
      }
      // If we've deleted the word
      else if (isDeleting && currentText === "") {
        setIsDeleting(false)
        // Move to the next word or back to the first if at the end
        setCurrentWordIndex((prev) =>
          infinite ? (prev + 1) % words.length : prev < words.length - 1 ? prev + 1 : prev,
        )
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, delay, infinite])

  return (
    <div className="font-medium text-muted-foreground flex items-center h-full justify-center lg:justify-start">
      <span>{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
        className="ml-1 inline-block h-5 sm:h-6 w-[2px] bg-primary"
      />
    </div>
  )
}

