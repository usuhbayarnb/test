"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Task, TaskHistory } from "./types"

interface TaskStoreContextType {
  tasks: Task[]
  taskHistory: TaskHistory[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, updates: Partial<Task>, userId: string, userName: string) => void
  deleteTask: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  getTasksByAssignee: (userId: string) => Task[]
  getTasksByClient: (clientId: string) => Task[]
  getTaskHistory: (taskId: string) => TaskHistory[]
}

const TaskStoreContext = createContext<TaskStoreContextType | undefined>(undefined)

// Mock initial data
const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Setup new workstation",
    description: "Need to setup a new workstation for the marketing department",
    status: "pending",
    priority: "high",
    clientId: "3",
    clientName: "Mike Client",
    assignedToId: null,
    assignedToName: null,
    createdById: "3",
    createdByName: "Mike Client",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    dueDate: new Date("2025-01-15"),
  },
  {
    id: "2",
    title: "Network connectivity issues",
    description: "Internet connection dropping frequently in conference room B",
    status: "in_progress",
    priority: "urgent",
    clientId: "3",
    clientName: "Mike Client",
    assignedToId: "2",
    assignedToName: "Sarah Employee",
    createdById: "3",
    createdByName: "Mike Client",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-13"),
    dueDate: new Date("2025-01-14"),
  },
]

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])

  useEffect(() => {
    // Load from localStorage
    const storedTasks = localStorage.getItem("tasks")
    const storedHistory = localStorage.getItem("taskHistory")

    if (storedTasks) {
      setTasks(
        JSON.parse(storedTasks, (key, value) => {
          if (key === "createdAt" || key === "updatedAt" || key === "dueDate") {
            return value ? new Date(value) : null
          }
          return value
        }),
      )
    } else {
      setTasks(INITIAL_TASKS)
      localStorage.setItem("tasks", JSON.stringify(INITIAL_TASKS))
    }

    if (storedHistory) {
      setTaskHistory(
        JSON.parse(storedHistory, (key, value) => {
          if (key === "createdAt") {
            return new Date(value)
          }
          return value
        }),
      )
    }
  }, [])

  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))

    // Add history entry
    addHistoryEntry(newTask.id, taskData.createdById, taskData.createdByName, "created", "Task created")
  }

  const updateTask = (id: string, updates: Partial<Task>, userId: string, userName: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates, updatedAt: new Date() }

        // Create history entries for changes
        if (updates.status && updates.status !== task.status) {
          addHistoryEntry(
            id,
            userId,
            userName,
            "status_changed",
            `Status changed from ${task.status} to ${updates.status}`,
          )
        }
        if (updates.assignedToId && updates.assignedToId !== task.assignedToId) {
          addHistoryEntry(id, userId, userName, "assigned", `Task assigned to ${updates.assignedToName}`)
        }
        if (updates.priority && updates.priority !== task.priority) {
          addHistoryEntry(
            id,
            userId,
            userName,
            "priority_changed",
            `Priority changed from ${task.priority} to ${updates.priority}`,
          )
        }

        return updatedTask
      }
      return task
    })

    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const addHistoryEntry = (taskId: string, userId: string, userName: string, action: string, details: string) => {
    const newEntry: TaskHistory = {
      id: Date.now().toString(),
      taskId,
      userId,
      userName,
      action,
      details,
      createdAt: new Date(),
    }

    const updatedHistory = [...taskHistory, newEntry]
    setTaskHistory(updatedHistory)
    localStorage.setItem("taskHistory", JSON.stringify(updatedHistory))
  }

  const getTaskById = (id: string) => tasks.find((task) => task.id === id)
  const getTasksByAssignee = (userId: string) => tasks.filter((task) => task.assignedToId === userId)
  const getTasksByClient = (clientId: string) => tasks.filter((task) => task.clientId === clientId)
  const getTaskHistory = (taskId: string) => taskHistory.filter((entry) => entry.taskId === taskId)

  return (
    <TaskStoreContext.Provider
      value={{
        tasks,
        taskHistory,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        getTasksByAssignee,
        getTasksByClient,
        getTaskHistory,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  )
}

export function useTaskStore() {
  const context = useContext(TaskStoreContext)
  if (context === undefined) {
    throw new Error("useTaskStore must be used within a TaskStoreProvider")
  }
  return context
}
