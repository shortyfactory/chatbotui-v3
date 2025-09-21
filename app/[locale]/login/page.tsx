import LoginFormClient from "@/components/login/login-form"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login"
}

export default async function Login({
  searchParams
}: {
  searchParams: { message: string; magic: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
  const session = (await supabase.auth.getSession()).data.session

  if (session) {
    const { data: homeWorkspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(error.message)
    }

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  const isMagicLinkEnabled =
    process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED === "true"

  return <LoginFormClient
    isMagicLinkEnabled={isMagicLinkEnabled}
    searchParams={searchParams}
  />
}
