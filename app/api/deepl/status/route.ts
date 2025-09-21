import { getDeeplDocumentStatus } from "@/lib/deepl"
import { NextApiResponse } from "next"

export async function POST(request: Request, _response: NextApiResponse) {
  const payload = (await request.json()) as {
    documentId: string
    documentKey: string
  }

  const { data, message } = await getDeeplDocumentStatus(payload)

  return new Response(JSON.stringify({ data, message }), {
    status: message ? 500 : 200
  })
}