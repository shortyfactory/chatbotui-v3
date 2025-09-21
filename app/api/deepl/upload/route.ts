import { uploadDocumentToDeepl } from "@/lib/deepl"
import { NextApiResponse } from "next"

export async function POST(request: Request, _response: NextApiResponse) {
  const formData = await request.formData()

  const file = formData.get("file") as File
  const source_language = formData.get("source_language") as string
  const target_language = formData.get("target_language") as string
  if (!file || !target_language) {
    return new Response(
      JSON.stringify({
        error: "No files received or no target target language."
      }),
      {
        status: 400
      }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const payload = {
    file_buffer: buffer,
    file_name: file.name,
    source_language,
    target_language
  }

  const { data, message } = await uploadDocumentToDeepl(payload)

  return new Response(JSON.stringify({ data, message }), {
    status: message ? 500 : 200
  })
}