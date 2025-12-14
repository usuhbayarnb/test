"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Users, PlusCircle, LogOut } from "lucide-react"

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        roles: ["manager", "employee", "client"],
      },
      {
        href: "/tasks",
        icon: ClipboardList,
        label: "Tasks",
        roles: ["manager", "employee", "client"],
      },
    ]

    if (user?.role === "manager") {
      baseItems.push({
        href: "/employees",
        icon: Users,
        label: "Employees",
        roles: ["manager"],
      })
    }

    if (user?.role === "client") {
      baseItems.push({
        href: "/new-task",
        icon: PlusCircle,
        label: "New Task",
        roles: ["client"],
      })
    }

    return baseItems.filter((item) => item.roles.includes(user?.role || ""))
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-6">
        <h1 className="text-xl font-bold">Менежерын систем</h1>
        <p className="text-sm text-muted-foreground">{user?.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Гарах
        </Button>
      </div>
    </div>
  )
}
