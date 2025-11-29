import { Sidebar } from "@/components/layout/Sidebar"
import { BackgroundBlob } from "@/components/ui/BackgroundBlob"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark flex min-h-screen flex-col md:flex-row relative overflow-hidden bg-background text-foreground">
            <BackgroundBlob />
            <aside className="w-full md:w-64 border-r border-white/10 glass sticky top-0 h-screen overflow-y-auto z-10 bg-black/20 backdrop-blur-xl">
                <Sidebar />
            </aside>
            <main className="flex-1 p-6 z-10 relative">
                {children}
            </main>
        </div>
    )
}
