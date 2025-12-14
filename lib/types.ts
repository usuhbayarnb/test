export type TaskStatus = "pending" | "in_progress" | "in_review" | "completed"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type UserRole = "manager" | "employee" | "client"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  clientId: string
  clientName: string
  assignedToId: string | null
  assignedToName: string | null
  createdById: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
  dueDate: Date | null
}

export interface TaskHistory {
  id: string
  taskId: string
  userId: string
  userName: string
  action: string
  details: string
  createdAt: Date
}
