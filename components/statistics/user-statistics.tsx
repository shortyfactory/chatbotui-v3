'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from "@/supabase/types"
import { supabase } from "@/lib/supabase/browser-client"
import { getUserStatistics, getProfileByUserId } from "@/db/profile"
import { IconLoader2 } from '@tabler/icons-react'
import { Label } from '../ui/label'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

export default function UserStatistics() {
  const router = useRouter()

  const [statistics, setStatistics] = useState<Tables<"analytics">[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ; (async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      }

      const profile = await getProfileByUserId(session.user.id)

      if (!profile || !profile.is_superadmin) {
        return router.push("/login")
      }

      try {
        const stats = await getUserStatistics()
        setStatistics(stats)
      } catch (err: any) {
        setError(err.message as string)
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  return (
    <div className="flex w-full flex-col mt-10 justify-center items-center gap-4 px-8">

      <Label className="text-2xl">
        ANALYTICS
      </Label>

      {loading && (
        <div className="flex size-full flex-col items-center justify-center mt-2">
          <IconLoader2 className="mt-4 size-12 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="text-red-600 mt-2 p-2 text-center">
          Error: {error}
        </p>
      )}

      {!loading && !error && statistics.length > 0 && (
        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Is Superadmin</TableHead>
              <TableHead className="text-center">Prompts</TableHead>
              <TableHead className="text-center">Own Prompts Library</TableHead>
              <TableHead className="text-center">Own Presets Library</TableHead>
              <TableHead className="text-center">Upload Files</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statistics.map((stat) => (
              <TableRow key={stat.user_id}>
                <TableCell>{stat.username}</TableCell>
                <TableCell>{stat.email}</TableCell>
                <TableCell className="text-center">{stat.is_superadmin ? "Yes" : "No"}</TableCell>
                <TableCell className="text-center">{stat.messages_count}</TableCell>
                <TableCell className="text-center">{stat.prompts_count}</TableCell>
                <TableCell className="text-center">{stat.presets_count}</TableCell>
                <TableCell className="text-center">{stat.files_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && !error && statistics.length === 0 && (
        <Label className="text-xl">
          No data available.
        </Label>
      )}
    </div>
  )
}
