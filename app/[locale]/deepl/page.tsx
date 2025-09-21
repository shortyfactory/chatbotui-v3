import DeeplApi from "@/components/deepl/deepl-api"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Document Translator"
}

export default async function Deepl() {

  return <DeeplApi />
}
