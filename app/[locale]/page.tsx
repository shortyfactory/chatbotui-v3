"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <Image
          src="/chatbot-ui-logo.png"
          width={80}
          height={80}
          alt="AI Chatbot"
        />
      </div>

      <div className="mt-2 text-3xl font-bold">AI Chatbot</div>

      <Link className="mt-4 flex w-[200px] items-center justify-center rounded-md p-2 font-semibold text-black" href="/login" style={{ backgroundColor: '#FDC400' }}>
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
