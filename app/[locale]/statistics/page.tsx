import UserStatistics from "@/components/statistics/user-statistics"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ANALYTICS"
}

export default async function UserStats() {

  return <UserStatistics />
}
