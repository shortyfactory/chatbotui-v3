import SDGMapper from "@/components/sdg/sdg-mapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "SDG MAPPER API"
}

export default async function SDG() {

  return <SDGMapper />
}
