-- ===========================================================
-- Migration: add_diplome_actor_and_update_situation_etudiant
-- Description:
--   1. Ajoute la valeur 'diplome' dans l'enum TypeUtilisateur
--   2. Ajoute les valeurs manquantes dans l'enum SituationEtudiant
--      (en_stage, freelance, entrepreneur, en_formation_continue,
--       en_recherche_emploi, expatrie, sans_activite)
-- ===========================================================

-- 1. Ajouter 'diplome' à l'enum TypeUtilisateur
ALTER TYPE "TypeUtilisateur" ADD VALUE 'diplome';

-- 2. Ajouter les valeurs manquantes à l'enum SituationEtudiant
ALTER TYPE "SituationEtudiant" ADD VALUE 'en_stage';
ALTER TYPE "SituationEtudiant" ADD VALUE 'freelance';
ALTER TYPE "SituationEtudiant" ADD VALUE 'entrepreneur';
ALTER TYPE "SituationEtudiant" ADD VALUE 'en_formation_continue';
ALTER TYPE "SituationEtudiant" ADD VALUE 'en_recherche_emploi';
ALTER TYPE "SituationEtudiant" ADD VALUE 'expatrie';
ALTER TYPE "SituationEtudiant" ADD VALUE 'sans_activite';
