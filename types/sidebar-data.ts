import { Tables } from "@/supabase/types"

export type DataListType =
  | Tables<"collections">[]
  | Tables<"chats">[]
  | Tables<"presets">[]
  | Tables<"prompts">[]
  | (Tables<"prompts_library"> & { user_id?: string; folder_id?: number })[]
  | Tables<"files">[]
  | Tables<"assistants">[]
  | Tables<"tools">[]
  | Tables<"models">[]

export type DataItemType =
  | Tables<"collections">
  | Tables<"chats">
  | Tables<"presets">
  | Tables<"prompts">
  | (Tables<"prompts_library"> & { user_id?: string; folder_id?: number })
  | Tables<"files">
  | Tables<"assistants">
  | Tables<"tools">
  | Tables<"models">
