"use client"

import Link from "next/link"
import Image from "next/image"
import { FC } from "react"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="#"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <Image
          src="/chatbot-ui-logo.png"
          width={80}
          height={80}
          alt="AI Chatbot"
        />
      </div>

      <div className="text-3xl font-bold tracking-wide">AI Chatbot</div>
    </Link>
  )
}
