import { createClient } from "@/lib/supabase/server"
import { get } from "@vercel/edge-config"
import { cookies, headers } from "next/headers"

const getEnvVarOrEdgeConfigValue = async (name: string) => {
  "use server"
  if (process.env.EDGE_CONFIG) {
    return await get<string>(name)
  }

  return process.env[name]
}

export const signIn = async ({
  email,
  password
}: {
  email: string
  password: string
}) => {
  "use server"

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const isMagicLinkEnabled =
    process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED === "true"

  if (isMagicLinkEnabled) {
    const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
      "EMAIL_DOMAIN_WHITELIST"
    )
    const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
      ? emailDomainWhitelistPatternsString?.split(",")
      : []
    const emailWhitelistPatternsString =
      await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
    const emailWhitelist = emailWhitelistPatternsString?.trim()
      ? emailWhitelistPatternsString?.split(",")
      : []

    // If there are whitelist patterns, check if the email is allowed to sign up
    if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
      const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
      const emailMatch = emailWhitelist?.includes(email)
      if (!domainMatch && !emailMatch) {
        return `/login?message=Email ${email} is not allowed to sign up.`
      }
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    })

    if (error) {
      return `/login?message=${error.message}`
    }

    if (data) {
      return "/login?magic=true"
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return `/login?message=${error.message}`
    }

    const { data: homeWorkspace, error: homeWorkspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(
        homeWorkspaceError?.message || "An unexpected error occurred"
      )
    }

    return `/${homeWorkspace.id}/chat`
  }
}

export const signUp = async ({
  email,
  password
}: {
  email: string
  password: string
}) => {
  "use server"

  const origin = headers().get("origin")
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const emailDomainWhitelistPatternsString = await getEnvVarOrEdgeConfigValue(
    "EMAIL_DOMAIN_WHITELIST"
  )
  const emailDomainWhitelist = emailDomainWhitelistPatternsString?.trim()
    ? emailDomainWhitelistPatternsString?.split(",")
    : []
  const emailWhitelistPatternsString =
    await getEnvVarOrEdgeConfigValue("EMAIL_WHITELIST")
  const emailWhitelist = emailWhitelistPatternsString?.trim()
    ? emailWhitelistPatternsString?.split(",")
    : []

  // If there are whitelist patterns, check if the email is allowed to sign up
  if (emailDomainWhitelist.length > 0 || emailWhitelist.length > 0) {
    const domainMatch = emailDomainWhitelist?.includes(email.split("@")[1])
    const emailMatch = emailWhitelist?.includes(email)
    if (!domainMatch && !emailMatch) {
      return `/login?message=Email ${email} is not allowed to sign up.`
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
      emailRedirectTo: `${origin}/setup`
    }
  })

  if (error) {
    console.error(error)
    return `/login?message=${error.message}`
  }

  // USE IF YOU WANT TO SEND EMAIL VERIFICATION, ALSO CHANGE TOML FILE
  return "/login?message=Check email to continue sign in process"
}

export const handleResetPassword = async ({
  email
}: {
  email: string
  password: string
}) => {
  "use server"

  const origin = headers().get("origin")
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/login/password`
  })

  if (error) {
    return `/login?message=${error.message}`
  }

  return "/login?message=Check email to reset password"
}
