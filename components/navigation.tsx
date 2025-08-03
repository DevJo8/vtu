"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Moon,
  Sun,
  Menu,
  X,
  Home,
  BookOpen,
  FileText,
  Code,
  Calculator,
  Lightbulb,
  GraduationCap,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/question-papers", label: "Papers", icon: FileText },
  { href: "/lab-programs", label: "Labs", icon: Code },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/projects", label: "Projects", icon: Lightbulb },
  { href: "/syllabus", label: "Syllabus", icon: GraduationCap },
  { href: "/results", label: "Results", icon: Award },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between relative">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/vtu-logo.png" alt="VTU Vault Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">VTU Vault</span>
            </Link>
            {/* News Headline - responsive on all screens */}
            {/* News Headline - responsive on all screens */}
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full justify-center items-center pointer-events-none">
  <span className="font-extrabold text-sm md:text-lg lg:text-xl xl:text-2xl text-center text-black dark:text-white tracking-widest drop-shadow-lg flex items-center gap-2 md:gap-3">
    <span className="text-sm md:text-lg lg:text-xl xl:text-2xl">📢</span>
    <span className="text-red-600 dark:text-red-400 animate-[newsFlash_2s_ease-in-out_infinite] font-black text-sm md:text-base lg:text-lg xl:text-xl bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent pointer-events-auto">
    
      <a 
        href="https://pump.fun" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="pointer-events-auto"
      >
        COMING SOON
      </a>
    </span>
  </span>
</div>




            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sliding Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-white/10 backdrop-blur-sm z-50"
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
            >
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Navigation</h3>

                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          pathname === item.href
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
