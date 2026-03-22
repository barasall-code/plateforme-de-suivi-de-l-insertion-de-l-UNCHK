-- CreateIndex
CREATE INDEX "candidatures_etudiantId_idx" ON "candidatures"("etudiantId");

-- CreateIndex
CREATE INDEX "candidatures_offreId_idx" ON "candidatures"("offreId");

-- CreateIndex
CREATE INDEX "candidatures_statut_idx" ON "candidatures"("statut");

-- CreateIndex
CREATE INDEX "etudiants_filiere_idx" ON "etudiants"("filiere");

-- CreateIndex
CREATE INDEX "etudiants_promotion_idx" ON "etudiants"("promotion");

-- CreateIndex
CREATE INDEX "etudiants_niveauEtude_idx" ON "etudiants"("niveauEtude");

-- CreateIndex
CREATE INDEX "offres_statut_idx" ON "offres"("statut");

-- CreateIndex
CREATE INDEX "offres_typeOffre_idx" ON "offres"("typeOffre");

-- CreateIndex
CREATE INDEX "offres_entrepriseId_idx" ON "offres"("entrepriseId");

-- CreateIndex
CREATE INDEX "offres_dateLimiteCandidature_idx" ON "offres"("dateLimiteCandidature");

-- CreateIndex
CREATE INDEX "utilisateurs_typeUtilisateur_idx" ON "utilisateurs"("typeUtilisateur");

-- CreateIndex
CREATE INDEX "utilisateurs_estActif_idx" ON "utilisateurs"("estActif");
