'use client'

import { useEffect, useRef, useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase/browser-client"
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { SubmitButton } from '../ui/submit-button'
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"

const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/pdf", // .pdf
  "text/html", // .html
  "text/plain", // .txt
  "application/xliff+xml" // .xliff
].join(",")

export default function DeeplApi() {
  const router = useRouter()

  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>("en")
  const [targetLanguage, setTargetLanguage] = useState<string>()
  const [sourceLanguages, setSourceLanguages] = useState<{ name: string; code: string; supportsFormality?: boolean }[]>([])
  const [targetLanguages, setTargetLanguages] = useState<{ name: string; code: string; supportsFormality?: boolean }[]>([])
  const [uploadResponse, setUploadResponse] = useState<{ documentId: string; documentKey: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isDownloadReady, setIsDownloadReady] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      }

      const response = await fetch("/api/deepl/languages")
      if (response.ok) {
        const { data } = await response.json()
        setSourceLanguages(data.sourceLanguages)
        setTargetLanguages(data.targetLanguages)

        setLoading(false)
      } else {
        const { message } = await response.json()
        setErrorMessage(message)
        setFileBuffer(null)
        setLoading(false)
      }

    })()
  }, [router])

  useEffect(() => {
    if (loading || !fileBuffer || !targetLanguage || !sourceLanguage || targetLanguage === sourceLanguage) {
      setIsSubmitDisabled(true)
    } else {
      setIsSubmitDisabled(false)
    }
  }, [fileBuffer, targetLanguage, sourceLanguage, loading])

  useEffect(() => {
    if (uploadResponse && !isDownloadReady && status !== 'error') {
      statusIntervalRef.current = setInterval(checkStatus, 2000)
    } else if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current)
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [uploadResponse, isDownloadReady, status])

  /**
   * Prevent drag-and-drop anywhere except on the file input
   */
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleWindowDrop = (e: DragEvent) => {
      // If the drop target is the file input or a child of it, allow the drop
      if (fileInputRef.current && fileInputRef.current.contains(e.target as Node)) {
        return
      }
      // Otherwise, prevent
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('drop', handleWindowDrop)

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [fileInputRef])

  const handleChooseFile = async (file: File) => {
    if (file) {
      if (ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
        const arrayBuffer = await file.arrayBuffer()
        setFileBuffer(arrayBuffer)
        setFileName(file.name)
      } else {
        setErrorMessage("Unsupported file type")
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setUploadResponse(null)
      setStatus(null)
      setIsDownloadReady(false)
      setErrorMessage(null)

      const formData = new FormData()
      formData.append("file", new Blob([fileBuffer || new ArrayBuffer(0)]), fileName as string)
      formData.append("source_language", sourceLanguage.toLowerCase())
      formData.append("target_language", targetLanguage?.toLowerCase() as string)

      const response = await fetch("/api/deepl/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { data } = await response.json()
        setUploadResponse(data)
        setFileBuffer(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        const { message } = await response.json()
        setErrorMessage(message)
        setFileBuffer(null)
        setLoading(false)
      }
    } catch (error) {
      if (fileInputRef.current?.value) {
        fileInputRef.current.value = ''
      }

      setErrorMessage('An unexpected error occurred.')
      setLoading(false)
      setFileBuffer(null)
    }
  }

  const checkStatus = async () => {
  if (!uploadResponse) return

  try {
    // Don’t do setLoading(true) here if you already did in handleSubmit
    // or do it once, at the start of checkStatus, but don’t turn it off
    // unless you are done or errored.
    // setLoading(true)

    const response = await fetch("/api/deepl/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uploadResponse),
    })

    if (response.ok) {
      const { data } = await response.json()

      if (data.status === "done") {
        // DONE: user can download
        setStatus("done")
        setIsDownloadReady(true)
        setLoading(false) // turn off spinner
      } else if (data.status === "error") {
        // ERROR: user cannot download
        setStatus("error")
        setIsDownloadReady(false)
        setErrorMessage(data.message)
        setLoading(false) // turn off spinner
      } else {
        // STILL IN PROGRESS: keep polling
        setStatus(data.status)
        // Critically: do NOT setLoading(false) here
        // keep the spinner spinning
      }
    } else {
      // Non-200 response from server
      const { message } = await response.json()
      setErrorMessage(message)
      setLoading(false) // you can turn off spinner or keep it on if you want
    }
  } catch (error) {
    // Request or parse error
    setErrorMessage("Failed to check status.")
    setLoading(false)
  }
}

  const downloadFile = async () => {
    if (!uploadResponse || !isDownloadReady) return

    const response = await fetch("/api/deepl/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uploadResponse),
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translated_${fileName}`
      a.click()
      window.URL.revokeObjectURL(url)

      setUploadResponse(null)
      setStatus(null)
      setIsDownloadReady(false)
      setErrorMessage(null)
      setFileBuffer(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      const { message } = await response.json()
      setErrorMessage(message)
    }
  }

  return (
    <div className="flex w-full flex-col mt-10 justify-center items-center gap-4 px-8">
      <Image
        src="/AI_Translator_grey.png"
        alt="AI Chatbot"
        width={185}
        height={185}
      />

      <Label className="text-2xl" htmlFor="file">
        Document Translator
      </Label>

      <div className="flex justify-center gap-4">
        <Input
          ref={fileInputRef}
          accept={ACCEPTED_FILE_TYPES}
          type="file"
          className="rounded-md border bg-inherit"
          name="file"
          required
          onChange={e => {
            if (!e.target.files) return
            handleChooseFile(e.target.files[0])
          }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <div>
          <Label>Source Language</Label>
          <Select
            value={sourceLanguage}
            onValueChange={(value) => {
              setSourceLanguage(value)
            }}
          >
            <SelectTrigger>
              <SelectValue defaultValue="EN" />
            </SelectTrigger>
            <SelectContent>
              {sourceLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Language</Label>
          <Select
            value={targetLanguage}
            onValueChange={(value) => {
              setTargetLanguage(value)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {targetLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SubmitButton
        onClick={() => handleSubmit()}
        className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
        disabled={isSubmitDisabled}
      >
        Translate File
      </SubmitButton>

      {loading && (
        <div className="flex size-full flex-col items-center justify-center mt-2">
          <IconLoader2 className="mt-4 size-12 animate-spin" />
        </div>
      )}

      {!loading && errorMessage && (
        <p className="text-red-600 mt-2 p-2 text-center">
          {errorMessage}
        </p>
      )}

      <div className="flex mt-5">
        {isDownloadReady && (
          <SubmitButton onClick={downloadFile}>
            Download Translated File
          </SubmitButton>
        )}
      </div>
    </div>
  )
}
