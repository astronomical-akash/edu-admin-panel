-- AlterTable
ALTER TABLE "Subtopic" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "_SubtopicRequiredLayers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubtopicRequiredLayers_AB_unique" ON "_SubtopicRequiredLayers"("A", "B");

-- CreateIndex
CREATE INDEX "_SubtopicRequiredLayers_B_index" ON "_SubtopicRequiredLayers"("B");

-- AddForeignKey
ALTER TABLE "_SubtopicRequiredLayers" ADD CONSTRAINT "_SubtopicRequiredLayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Layer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubtopicRequiredLayers" ADD CONSTRAINT "_SubtopicRequiredLayers_B_fkey" FOREIGN KEY ("B") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
