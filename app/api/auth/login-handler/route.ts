import { NextApiResponse } from "next"
import { handleResetPassword, signIn, signUp } from "@/lib/auth"

export async function POST(request: Request, response: NextApiResponse) {
  const json = await request.json()
  const { action, data } = json as {
    action: string
    data: {email: string; password: string}
  }

  let redirectUrl = "/login"

  if (action === "signIn") {
    redirectUrl = (await signIn(data)) ?? redirectUrl
  } else if (action === "signUp") {
    redirectUrl = await signUp(data)
  } else if (action === "resetPassword") {
    redirectUrl = await handleResetPassword(data)
  }

  return new Response(JSON.stringify({ redirectUrl }), {
    status: 200
  })
}
