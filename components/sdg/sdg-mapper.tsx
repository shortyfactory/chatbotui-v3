'use client'

import { useEffect, useRef, useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import mammoth from 'mammoth'
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase/browser-client"
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { SubmitButton } from '../ui/submit-button'
import Stats from './Stats'
import Image from "next/image"

const ACCEPTED_FILE_TYPES = [
  "text/markdown",
  "application/json",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/html",
  "multipart/related",
].join(",")

export default function SDGMapper() {
  const router = useRouter()

  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileBuffer, setFileBuffer] = useState<number[] | null>(null)
  const [sdgMapperApiResponse, setSdgMapperApiResponse] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ; (async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      }
    })()
  }, [])

  useEffect(() => {
    if ((!fileContent || fileContent?.length === 0) && !fileBuffer) {
      setIsSubmitDisabled(true)
    } else if (fileContent && fileContent.length > 3528000) {
      setErrorMessage("File content too long")
      setIsSubmitDisabled(true)
    } else {
      setIsSubmitDisabled(false)
    }
  }, [fileContent, fileBuffer])

  const handleChooseFile = async (file: File) => {
    if (file) {
      let simplifiedFileType = file.type.split("/")[1]
      const reader = new FileReader()

      if (ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
        if (
          simplifiedFileType.includes(
            "vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            "docx"
          )
        ) {
          simplifiedFileType = "docx"
        }

        if (
          file.type.includes(
            "vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            "docx"
          )
        ) {
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({
            arrayBuffer
          })

          setFileContent(result.value)
        }
        // Handle PDF
        else if (file.type === "application/pdf") {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onloadend = function () {
            setFileBuffer(Array.from(new Uint8Array(reader.result as ArrayBuffer)));
          }
        }
        // Handle HTML or MHTML
        else if (file.type.includes("html") || file.type === "multipart/related") {
          reader.readAsText(file)
          reader.onloadend = function () {
            setFileContent(reader.result as string)
          }
        }
        // Handle TXT, DOC (plain text files)
        else {
          reader.readAsText(file)
          reader.onloadend = function () {
            setFileContent(reader.result as string);
          }
        }
      } else {
        setErrorMessage("Unsupported file type")
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const data = JSON.stringify({
        input_text: fileContent,
        file_buffer: fileBuffer,
      })

      const response = await fetch("/api/sdg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      })

      if (response.ok) {
        const { data } = await response.json()
        setSdgMapperApiResponse(data)
        setLoading(false)
      } else {
        const { message } = await response.json()
        setErrorMessage(message)
        setFileContent(null)
        setFileBuffer(null)
        setLoading(false)
      }

      if (fileInputRef.current?.value) {
        fileInputRef.current.value = ''
        setFileContent(null)
        setFileBuffer(null)
      }
    } catch (error) {
      if (fileInputRef.current?.value) {
        fileInputRef.current.value = ''
      }

      setErrorMessage('An unexpected error occurred.')
      setLoading(false)
      setFileContent(null)
      setFileBuffer(null)
    }
  }

  return (
    <div className="flex w-full flex-col mt-10 justify-center items-center gap-4 px-8">


      <Image
          src="/sdg_goals.png"
          alt="AI Chatbot"
      />

      <Label className="text-2xl" htmlFor="file">
        SDG MAPPER API
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

        <SubmitButton
          onClick={() => handleSubmit()}
          className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
          disabled={isSubmitDisabled}
        >
          Submit
        </SubmitButton>
      </div>

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

      {!loading && sdgMapperApiResponse && (
        <div className="mt-2 p-4 mb-10 text-left w-full bg-muted/50 rounded-md overflow-auto">
          <pre>
           <Stats data={sdgMapperApiResponse}></Stats>
          </pre>
        </div>
      )}
    </div>
  )
}
