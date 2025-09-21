import fs from "fs"
import path from "path"
import { promisify } from "util"
import { get } from "@vercel/edge-config"
import * as deepl from "deepl-node"

const getEnvVarOrEdgeConfigValue = async (name: string) => {
  "use server"
  if (process.env.EDGE_CONFIG) {
    return await get<string>(name)
  }
  return process.env[name]
}

const getDeeplTranslator = async () => {
  const deeplApiKey = (await getEnvVarOrEdgeConfigValue(
    "DEEPL_API_KEY"
  )) as string
  const deeplApiServerUrl = (await getEnvVarOrEdgeConfigValue(
    "DEEPL_API_SERVER_URL"
  )) as string

  const deeplTranslator = new deepl.Translator(deeplApiKey, {
    serverUrl: deeplApiServerUrl
  })

  return deeplTranslator
}

const unlinkAsync = promisify(fs.unlink)

export const uploadDocumentToDeepl = async ({
  file_buffer,
  file_name,
  source_language,
  target_language
}: {
  file_buffer: Buffer
  file_name: string
  source_language: string
  target_language: string
}): Promise<{ data?: any; message?: string }> => {
  try {
    const deeplTranslator = await getDeeplTranslator()
    const result = await deeplTranslator.uploadDocument(
      file_buffer,
      source_language as deepl.SourceLanguageCode,
      target_language as deepl.TargetLanguageCode,
      {
        filename: file_name
      }
    )

    return { data: result }
  } catch (error) {
    console.log("uploadDocumentToDeepl - DEEPL API ERROR:", error)
    return { message: "DEEPL API ERROR" }
  }
}

export const getDeeplDocumentStatus = async ({
  documentId,
  documentKey
}: {
  documentId: string
  documentKey: string
}): Promise<{ data?: any; message?: string }> => {
  try {
    const deeplTranslator = await getDeeplTranslator()
    const result = await deeplTranslator.getDocumentStatus({
      documentId,
      documentKey
    })

    return { data: result }
  } catch (error) {
    console.log("getDeeplDocumentStatus - DEEPL API ERROR:", error)
    return { message: "DEEPL API ERROR" }
  }
}

export const getDeeplDocument = async ({
  documentId,
  documentKey
}: {
  documentId: string
  documentKey: string
}) => {
  try {
    const deeplTranslator = await getDeeplTranslator()
    const tempFilePath = path.join(process.cwd(), "tempfile")
    await deeplTranslator.downloadDocument(
      {
        documentId,
        documentKey
      },
      tempFilePath
    )

    const fileStream = fs.createReadStream(tempFilePath)
    const headers = new Headers({
      "Content-Disposition": 'attachment; filename="translated_document"',
      "Content-Type": "application/octet-stream"
    })

    fileStream.on("close", async () => {
      try {
        await unlinkAsync(tempFilePath)
      } catch (error) {
        console.error(`Failed to delete temporary file ${tempFilePath}:`, error)
      }
    })

    return new Response(fileStream as unknown as BodyInit, { headers })
  } catch (error) {
    console.log("getDeeplDocumentStatus - DEEPL API ERROR:", error)
    return new Response(JSON.stringify({ message: "DEEPL API ERROR" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export const getDeeplLanguages = async (): Promise<{
  data?: any
  message?: string
}> => {
  try {
    const deeplTranslator = await getDeeplTranslator()
    const sourceLanguages = await deeplTranslator.getSourceLanguages()
    const targetLanguages = await deeplTranslator.getTargetLanguages()

    const result = {
      sourceLanguages,
      targetLanguages
    }

    return { data: result }
  } catch (error) {
    console.log("getDeeplLanguages - DEEPL API ERROR:", error)
    return { message: "DEEPL API ERROR" }
  }
}