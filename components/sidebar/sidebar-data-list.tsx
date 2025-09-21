import { ChatbotUIContext } from "@/context/context"
import { updateAssistant } from "@/db/assistants"
import { updateChat } from "@/db/chats"
import { updateCollection } from "@/db/collections"
import { updateFile } from "@/db/files"
import { updateModel } from "@/db/models"
import { updatePreset } from "@/db/presets"
import { updatePrompt } from "@/db/prompts"
import { updateTool } from "@/db/tools"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType, DataListType } from "@/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Separator } from "../ui/separator"
import { AssistantItem } from "./items/assistants/assistant-item"
import { ChatItem } from "./items/chat/chat-item"
import { CollectionItem } from "./items/collections/collection-item"
import { FileItem } from "./items/files/file-item"
import { Folder } from "./items/folders/folder-item"
import { ModelItem } from "./items/models/model-item"
import { PresetItem } from "./items/presets/preset-item"
import { PromptItem } from "./items/prompts/prompt-item"
import { ToolItem } from "./items/tools/tool-item"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@radix-ui/react-collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"

interface SidebarDataListProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
}

export const SidebarDataList: FC<SidebarDataListProps> = ({
  contentType,
  data,
  folders
}) => {
  const {
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setTools,
    setModels,
    promptsLibrary,
    presetsLibrary
  } = useContext(ChatbotUIContext)

  const divRef = useRef<HTMLDivElement>(null)

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const getDataListComponent = (
    contentType: ContentType,
    item: DataItemType
  ) => {
    switch (contentType) {
      case "chats":
        return <ChatItem key={item.id} chat={item as Tables<"chats">} />

      case "presets":
        return <PresetItem key={item.id} preset={item as Tables<"presets">} />

      case "prompts":
        return (
          <PromptItem
            key={item.id}
            prompt={
              item as Tables<"prompts" | "prompts_library"> & {
                user_id?: string
                folder_id?: number
              }
            }
          />
        )

      case "files":
        return <FileItem key={item.id} file={item as Tables<"files">} />

      case "collections":
        return (
          <CollectionItem
            key={item.id}
            collection={item as Tables<"collections">}
          />
        )

      case "assistants":
        return (
          <AssistantItem
            key={item.id}
            assistant={item as Tables<"assistants">}
          />
        )

      case "tools":
        return <ToolItem key={item.id} tool={item as Tables<"tools">} />

      case "models":
        return <ModelItem key={item.id} model={item as Tables<"models">} />

      default:
        return null
    }
  }

  const getSortedData = (
    data: any,
    dateCategory: "Today" | "Yesterday" | "Previous Week" | "Older"
  ) => {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const yesterdayStart = new Date(
      new Date().setDate(todayStart.getDate() - 1)
    )
    const oneWeekAgoStart = new Date(
      new Date().setDate(todayStart.getDate() - 7)
    )

    return data
      .filter((item: any) => {
        const itemDate = new Date(item.updated_at || item.created_at)
        switch (dateCategory) {
          case "Today":
            return itemDate >= todayStart
          case "Yesterday":
            return itemDate >= yesterdayStart && itemDate < todayStart
          case "Previous Week":
            return itemDate >= oneWeekAgoStart && itemDate < yesterdayStart
          case "Older":
            return itemDate < oneWeekAgoStart
          default:
            return true
        }
      })
      .sort(
        (
          a: { updated_at: string; created_at: string },
          b: { updated_at: string; created_at: string }
        ) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      )
  }

  const updateFunctions = {
    chats: updateChat,
    presets: updatePreset,
    prompts: updatePrompt,
    prompts_library: null,
    files: updateFile,
    collections: updateCollection,
    assistants: updateAssistant,
    tools: updateTool,
    models: updateModel
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    prompts_library: null,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    models: setModels
  }

  const updateFolder = async (itemId: string, folderId: string | null) => {
    const item: any = data.find(item => item.id === itemId)

    if (!item) return null

    const updateFunction = updateFunctions[contentType]
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!updateFunction || !setStateFunction) return

    const updatedItem = await updateFunction(item.id, {
      folder_id: folderId
    })

    setStateFunction((items: any) =>
      items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    )
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const target = e.target as Element

    if (!target.closest("#folder")) {
      const itemId = e.dataTransfer.getData("text/plain")
      updateFolder(itemId, null)
    }

    setIsDragOver(false)
  }

  useEffect(() => {
    if (divRef.current) {
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.clientHeight
      )
    }
  }, [data])

  const dataWithFolders = data.filter(item => item.folder_id)
  const dataWithoutFolders = data.filter(item => !item.folder_id)

  return (
    <>
      <div
        ref={divRef}
        className="mt-2 flex flex-col overflow-auto"
        onDrop={handleDrop}
      >
        {data.length === 0 && contentType !== "prompts" && contentType !== "presets" && (
          <div className="flex grow flex-col items-center justify-center">
            <div className=" text-center text-muted-foreground p-8 text-lg italic">
              No {contentType}.
            </div>
          </div>
        )}

        {(dataWithFolders.length > 0 ||
          dataWithoutFolders.length > 0 ||
          contentType === "prompts" || contentType === "presets") && (
            <div
              className={`h-full ${isOverflowing ? "w-[calc(100%-8px)]" : "w-full"
                } space-y-2 pt-2 ${isOverflowing ? "mr-2" : ""}`}
            >
              {folders.map(folder => (
                <Folder
                  key={folder.id}
                  folder={folder}
                  onUpdateFolder={updateFolder}
                  contentType={contentType}
                >
                  {dataWithFolders
                    .filter(item => item.folder_id === folder.id)
                    .map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id)}
                      >
                        {getDataListComponent(contentType, item)}
                      </div>
                    ))}
                </Folder>
              ))}

              {folders.length > 0 && <Separator />}

              {contentType === "chats" ? (
                <>
                  {["Today", "Yesterday", "Previous Week", "Older"].map(
                    dateCategory => {
                      const sortedData = getSortedData(
                        dataWithoutFolders,
                        dateCategory as
                        | "Today"
                        | "Yesterday"
                        | "Previous Week"
                        | "Older"
                      )

                      return (
                        sortedData.length > 0 && (
                          <div key={dateCategory} className="pb-2">
                            <div className="text-muted-foreground mb-1 text-sm font-bold">
                              {dateCategory}
                            </div>

                            <div
                              className={cn(
                                "flex grow flex-col",
                                isDragOver && "bg-accent"
                              )}
                              onDrop={handleDrop}
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDragOver={handleDragOver}
                            >
                              {sortedData.map((item: any) => (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={e => handleDragStart(e, item.id)}
                                >
                                  {getDataListComponent(contentType, item)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )
                    }
                  )}
                </>
              ) : (
                <div
                  className={cn("flex grow flex-col", isDragOver && "bg-accent")}
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                >
                  <>
                    {contentType === "prompts" && (
                      <>
                        <div
                          className="flex grow flex-col"
                          onDrop={handleDrop}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                        >
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={toggleExpand}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center cursor-pointer">
                                {isExpanded ? (
                                  <IconChevronDown size={24} />
                                ) : (
                                  <IconChevronRight size={24} />
                                )}
                                <span className="ml-2 text-base">
                                  Prompt Library
                                </span>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="relative">
                              <div className="absolute left-3 top-0 bottom-2 w-px bg-gray-400"></div>
                              {contentType === "prompts" && (
                                <div>
                                  {promptsLibrary.map((item: any) => (
                                    <div
                                      key={item.id}
                                      draggable
                                      className="flex pl-8 items-center mt-2"
                                      onDragStart={e =>
                                        handleDragStart(e, item.id)
                                      }
                                    >
                                      {getDataListComponent("prompts", item)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        <Separator />
                      </>
                    )}

                    {contentType === "presets" && (
                      <>
                        <div
                          className="flex grow flex-col"
                          onDrop={handleDrop}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                        >
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={toggleExpand}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center cursor-pointer">
                                {isExpanded ? (
                                  <IconChevronDown size={24} />
                                ) : (
                                  <IconChevronRight size={24} />
                                )}
                                <span className="ml-2 text-base">
                                  Presets Library
                                </span>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="relative">
                              <div className="absolute left-3 top-0 bottom-2 w-px bg-gray-400"></div>
                              {contentType === "presets" && (
                                <div>
                                  {presetsLibrary.map((item: any) => (
                                    <div
                                      key={item.id}
                                      draggable
                                      className="flex pl-8 items-center mt-2"
                                      onDragStart={e =>
                                        handleDragStart(e, item.id)
                                      }
                                    >
                                      {getDataListComponent("presets", item)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        <Separator />
                      </>
                    )}

                    {dataWithoutFolders.length > 0 ? (
                      dataWithoutFolders.map(item => {
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={e => handleDragStart(e, item.id)}
                          >
                            {getDataListComponent(contentType, item)}
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex grow flex-col items-center justify-center">
                        <div className=" text-center text-muted-foreground p-8 text-lg italic">
                          No {contentType}.
                        </div>
                      </div>
                    )}
                  </>
                </div>
              )}
            </div>
          )}
      </div>

      <div
        className={cn("flex grow", isDragOver && "bg-accent")}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      />
    </>
  )
}
