import { Home, Users, UserCircle, Calendar, Pill, FileText, RotateCcw, ClipboardList, FolderOpen } from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home, title: "Dashboard", path: "/" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  let items = [...baseItems]

  // Add doctor-specific items (only show for doctors, not superusers unless they are also doctors)
  const isDoctor = (currentUser as any)?.role === "doctor" || (currentUser as any)?.is_doctor === true
  if (isDoctor) {
    items.push(
      { icon: UserCircle, title: "Patients", path: "/patients" },
      { icon: Calendar, title: "Appointments", path: "/appointments" },
      { icon: FolderOpen, title: "Cases", path: "/cases" },
      { icon: ClipboardList, title: "Prescriptions", path: "/prescriptions" },
      { icon: Pill, title: "Medicines", path: "/medicines" },
      { icon: FileText, title: "Reports", path: "/reports" },
      { icon: RotateCcw, title: "Followups", path: "/followups" }
    )
  }

  // Add admin items
  if (currentUser?.is_superuser) {
    items.push({ icon: Users, title: "Admin", path: "/admin" })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
