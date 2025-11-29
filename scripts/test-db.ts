import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Fetching classes...")
        const classes = await prisma.class.findMany()
        console.log("Classes:", classes)

        if (classes.length > 0) {
            const classId = classes[0].id
            console.log("Fetching subjects for class:", classId)
            const subjects = await prisma.subject.findMany({ where: { classId } })
            console.log("Subjects:", subjects)

            if (subjects.length > 0) {
                const subjectId = subjects[0].id
                console.log("Fetching details for subject:", subjectId)
                const subject = await prisma.subject.findUnique({
                    where: { id: subjectId },
                    include: {
                        chapters: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                topics: {
                                    orderBy: { orderIndex: 'asc' },
                                    include: {
                                        subtopics: {
                                            orderBy: { orderIndex: 'asc' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                console.log("Subject Details:", JSON.stringify(subject, null, 2))
            }
        }
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
