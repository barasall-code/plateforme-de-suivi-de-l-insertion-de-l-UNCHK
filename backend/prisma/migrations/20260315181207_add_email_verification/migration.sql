-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "emailVerifie" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VerificationEmail" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationEmail_token_key" ON "VerificationEmail"("token");

-- AddForeignKey
ALTER TABLE "VerificationEmail" ADD CONSTRAINT "VerificationEmail_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
