"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/lib/auth-context"
import { useTaskStore } from "@/lib/task-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TaskPriority } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function NewTaskPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addTask } = useTaskStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [dueDate, setDueDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsSubmitting(true)

    addTask({
      title,
      description,
      status: "pending",
      priority,
      clientId: user.id,
      clientName: user.name,
      assignedToId: null,
      assignedToName: null,
      createdById: user.id,
      createdByName: user.name,
      dueDate: dueDate || null,
    })

    setIsSubmitting(false)
    router.push("/dashboard")
  }

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Шинэ таск үүсгэх</h1>
              <p className="text-muted-foreground">IT team-ээс хэрэгтэй дэмжлэгээ аваарай.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Таскийн талаарх мэдээлэл</CardTitle>
                <CardDescription>Үүсгэж буй таскийн тухай мэдээллээ оруулаарай.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Гарчиг <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Үүссэн асуудлын талаарх товч гарчиг..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Дэлгэрэнгүй тайлбар <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Асуудлын талаар дэлгэрэнгүй бичнэ үү..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Илүү дэлгэрэнгүй мэдээлэл бичих тусам IT багт хэрэгтэй бөгөөд хурдан шийдэгдэх боломжтой болно.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        Хүсэлтийн эрэмбэ <span className="text-destructive">*</span>
                      </Label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Бага - Хүлээж чадна</SelectItem>
                          <SelectItem value="medium">Дундаж - Хугацаандаа шийдүүлэх</SelectItem>
                          <SelectItem value="high">Өндөр - Хурдан шийдүүлэх</SelectItem>
                          <SelectItem value="urgent">Яаралтай - Маш хэрэгтэй</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Эцсийн хугацаа (Сонголтоор)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dueDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Өдрөө сонгоорой"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h3 className="mb-2 font-semibold">Дараа нь юу болох вэ?</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>1. Таны илгээсэн хүсэлтийг манай IT менежер хянан үзнэ</li>
                      <li>2. Тухайн асуудлыг шийдвэрлэх мэргэжилтэнг томилогдоно</li>
                      <li>3. Та өөрийн хяналтын самбараас шийдвэрлэлтийн явцыг харах боломжтой</li>
                      <li>4. Төлөв өөрчлөгдөх бүрд танд мэдэгдэл хүргэгдэнэ</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Submitting..." : "Хүсэлтийг илгээх"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                      Цуцлах
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
