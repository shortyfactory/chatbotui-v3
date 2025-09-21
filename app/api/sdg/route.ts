import { getSDGResponse } from "@/lib/sdg"
import { NextApiResponse } from "next"

export async function POST(request: Request, _response: NextApiResponse) {
  const json = await request.json()
  const { input_text, file_buffer } = json as {
    input_text: string
    file_buffer: number[]
  }

  const { data, message } = await getSDGResponse({ input_text, file_buffer })

  return new Response(JSON.stringify({ data, message }), {
    status: message ? 500 : 200
  })
}
