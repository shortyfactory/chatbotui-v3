import { get } from "@vercel/edge-config"
import PDFParser from "pdf2json"

const getEnvVarOrEdgeConfigValue = async (name: string) => {
  "use server"
  if (process.env.EDGE_CONFIG) {
    return await get<string>(name)
  }
  return process.env[name]
}

export const getSDGResponse = async ({
  input_text,
  file_buffer
}: {
  input_text?: string
  file_buffer?: number[]
}): Promise<{ data?: any; message?: string }> => {
  try {
    const sdgApiKey = (await getEnvVarOrEdgeConfigValue(
      "SDG_API_KEY"
    )) as string

    if (file_buffer) {
      const buffer = Buffer.from(new Uint8Array(file_buffer))
      const pdfParser = new PDFParser(null, true)

      return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          let parsedText = pdfParser.getRawTextContent()

          // Remove page break lines like "----------------Page (X) Break----------------"
          parsedText = parsedText
            ?.replace(/----------------Page \(\d+\) Break----------------/g, "")
            ?.trim()

          if (!parsedText) {
            return resolve({ message: "No text extracted from file." })
          }

          if (parsedText && parsedText.length > 3528000) {
            resolve({ message: "File content too long" })
          }

          resolve(fetchSDGMapper(parsedText, sdgApiKey))
        })

        pdfParser.on("pdfParser_dataError", (errData: any) => {
          resolve({ message: errData.parserError })
        })

        pdfParser.parseBuffer(buffer)
      })
    }

    if (input_text) {
      return fetchSDGMapper(input_text, sdgApiKey)
    }

    return { message: "No valid input provided." }
  } catch (error) {
    console.log("SDG API ERROR:", error)
    return { message: "SDG MAPPER API ERROR" }
  }
}

const fetchSDGMapper = async (
  input_text: string,
  sdgApiKey: string
): Promise<{ data?: string; message?: string }> => {
  try {
    const response = await fetch(
      "https://knowsdgs.jrc.ec.europa.eu/api/rest/mappingdata",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": sdgApiKey as string
        },
        body: JSON.stringify({
          input_text,
          indicators: "False",
          source_language: "en"
        })
      }
    )

    if (response.ok) {
      if (response.status === 204) {
        return { data: '{"message":"Successful request with no results"}' }
      } else {
        const result = await response.json()
        return { data: result["data"] }
      }
    } else {
      return { message: `SDG MAPPER API ERROR, STATUS: ${response.status}` }
    }
  } catch (error) {
    console.log("SDG API ERROR:", error)
    return { message: "SDG MAPPER API ERROR" }
  }
}
