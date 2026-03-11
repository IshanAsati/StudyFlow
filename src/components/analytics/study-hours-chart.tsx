import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTaskStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StudyHoursChartProps {
  sessions?: { started_at: string; duration: number; subject_id?: string | null }[]
}

export function StudyHoursChart({ sessions = [] }: StudyHoursChartProps) {
  const { subjects } = useTaskStore()

  // Group sessions by subject
  const data = subjects.map((subject) => {
    const subjectSessions = sessions.filter((s) => s.subject_id === subject.id)
    const totalMinutes = subjectSessions.reduce((acc, s) => acc + s.duration, 0)
    return {
      name: subject.name,
      minutes: totalMinutes,
      color: subject.color,
    }
  })

  // Add a "No Subject" category
  const noSubjectSessions = sessions.filter((s) => !s.subject_id)
  const noSubjectMinutes = noSubjectSessions.reduce((acc, s) => acc + s.duration, 0)
  if (noSubjectMinutes > 0) {
    data.push({
      name: 'General',
      minutes: noSubjectMinutes,
      color: '#888888',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Hours by Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${Math.floor(value / 60)}h ${value % 60}m`}
                />
                <Bar dataKey="minutes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No study data yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
