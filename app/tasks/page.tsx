"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/lib/auth-context"
import { useTaskStore } from "@/lib/task-store"
import { TaskCard } from "@/components/task-card"
import { TaskDialog } from "@/components/task-dialog"
import type { Task, TaskStatus } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

const MOCK_EMPLOYEES = [
  { id: "2", name: "Sarah Employee" },
  { id: "4", name: "John Tech" },
  { id: "5", name: "Emma Support" },
]

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, getTasksByAssignee, getTasksByClient } = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  const getFilteredTasks = () => {
    if (user?.role === "manager") {
      return tasks
    } else if (user?.role === "employee") {
      return getTasksByAssignee(user.id)
    } else if (user?.role === "client") {
      return getTasksByClient(user.id)
    }
    return []
  }

  const filteredTasks = getFilteredTasks()

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const renderTaskGrid = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <p className="text-muted-foreground">Хоосон</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {taskList.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
        ))}
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Хүсэлтүүд</h1>
              <p className="text-muted-foreground">Хүсэлтийн төлөвийг харах</p>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Бүх хүсэлт</TabsTrigger>
                <TabsTrigger value="pending">Хүлээгдэж буй</TabsTrigger>
                <TabsTrigger value="in_progress">Шийдвэрлэгдэж буй</TabsTrigger>
                <TabsTrigger value="in_review">Хянагдаж буй</TabsTrigger>
                <TabsTrigger value="completed">Дууссан</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {renderTaskGrid(filteredTasks)}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {renderTaskGrid(getTasksByStatus("pending"))}
              </TabsContent>

              <TabsContent value="in_progress" className="space-y-4">
                {renderTaskGrid(getTasksByStatus("in_progress"))}
              </TabsContent>

              <TabsContent value="in_review" className="space-y-4">
                {renderTaskGrid(getTasksByStatus("in_review"))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {renderTaskGrid(getTasksByStatus("completed"))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <TaskDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={MOCK_EMPLOYEES}
        showAssignment={user?.role === "manager"}
        showStatusChange={user?.role === "employee" || user?.role === "manager"}
      />
    </ProtectedRoute>
  )
}
