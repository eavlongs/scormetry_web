import { AppSidebar } from '@/components/app-sidebar'
import { Navbar } from '@/components/navbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getClassrooms } from './actions'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const classrooms = await getClassrooms()
    return (
        <SidebarProvider>
            <AppSidebar classrooms={classrooms} />
            <SidebarInset>
                <Navbar />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
