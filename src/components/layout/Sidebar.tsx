import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Layers, FileText, BookOpen, GraduationCap } from "lucide-react"

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="p-6 border-b border-white/10 flex items-center gap-3">

                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate">
                            AdarshabaniNXT
                        </h1>
                    </div>
                    <div className="space-y-1 mt-4">
                        <Button variant="secondary" className="w-full justify-start" asChild>
                            <Link href="/dashboard/hierarchy">
                                <Layers className="mr-2 h-4 w-4" />
                                Hierarchy
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/dashboard/resources">
                                <FileText className="mr-2 h-4 w-4" />
                                Resources
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/dashboard/learning-path">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Learning Path
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/dashboard/quizzes">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Quizzes
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
