import { getDeeplDocument } from "@/lib/deepl"
import { NextApiResponse } from "next"

export async function POST(request: Request, _response: NextApiResponse) {
  const payload = (await request.json()) as {
    documentId: string
    documentKey: string
  }

  return await getDeeplDocument(payload)
}