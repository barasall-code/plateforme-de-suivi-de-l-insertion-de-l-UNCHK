-- CreateEnum
CREATE TYPE "SituationEtudiant" AS ENUM ('en_cours_etude', 'sous_contrat_stage', 'sous_contrat_cdd', 'sous_contrat_cdi', 'chomeur');

-- AlterTable
ALTER TABLE "etudiants" ADD COLUMN     "situationActuelle" "SituationEtudiant" DEFAULT 'en_cours_etude';
