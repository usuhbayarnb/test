"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { useTaskStore } from "@/lib/task-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

const MOCK_EMPLOYEES = [
  { id: "2", name: "Сараа Employee", email: "employee@company.com", role: "Senior Technician" },
  { id: "4", name: "Болд Tech", email: "bold@company.com", role: "IT Support Specialist" },
  { id: "5", name: "Энхлэн Support", email: "enkhlen@company.com", role: "Junior Technician" },
]

export default function EmployeesPage() {
  const { tasks } = useTaskStore()

  const getEmployeeStats = (employeeId: string) => {
    const employeeTasks = tasks.filter((t) => t.assignedToId === employeeId)
    return {
      total: employeeTasks.length,
      active: employeeTasks.filter((t) => t.status === "in_progress").length,
      completed: employeeTasks.filter((t) => t.status === "completed").length,
    }
  }

  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Ажилчдын мэдээлэл</h1>
              <p className="text-muted-foreground">IT team-ээ удирдах</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_EMPLOYEES.map((employee) => {
                const stats = getEmployeeStats(employee.id)
                const initials = employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")

                return (
                  <Card key={employee.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{employee.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{stats.total} даалгавар гүйцэтгэсэн</span>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="outline">{stats.active} идэвхтэй</Badge>
                        <Badge variant="secondary">{stats.completed} дууссан</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
