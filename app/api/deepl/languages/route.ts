import { getDeeplLanguages } from "@/lib/deepl"
import { NextApiResponse } from "next"

export async function GET(_request: Request, _response: NextApiResponse) {
  const { data, message } = await getDeeplLanguages()

  return new Response(JSON.stringify({ data, message }), {
    status: message ? 500 : 200
  })
}