"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const lines = [
    "$ initializing vtu-vault...",
    "$ loading academic resources...",
    "$ connecting to database...",
    "$ setting up user interface...",
    "$ ready to serve VTU students",
    "$ welcome to VTU Vault",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < lines.length - 1) {
          return prev + 1
        } else {
          clearInterval(timer)
          setTimeout(onComplete, 1000)
          return prev
        }
      })
    }, 600)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black text-green-400 font-mono flex items-center justify-center z-50"
      >
        <div className="max-w-2xl w-full px-8">
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-4xl font-bold mb-2">VTU VAULT</div>
              <div className="text-sm opacity-70">Academic Resource Terminal v1.0</div>
            </motion.div>
          </div>

          <div className="space-y-2">
            {lines.slice(0, currentLine + 1).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <span>{line}</span>
                {index === currentLine && <span className={`ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}>_</span>}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: currentLine >= lines.length - 1 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="text-sm opacity-70">Press any key to continue...</div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
