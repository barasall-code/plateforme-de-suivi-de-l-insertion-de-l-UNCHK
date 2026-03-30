// Utilitaire export statistiques — Ministère / Direction

export function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row =>
    Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function exportRapportInstitutionnel(stats: any, avancees: any) {
  const lignes = [
    { Indicateur: "Taux d'insertion (%)", Valeur: stats?.tauxInsertion ?? 0 },
    { Indicateur: "Total étudiants/diplômés", Valeur: stats?.totalEtudiants ?? 0 },
    { Indicateur: "Entreprises partenaires", Valeur: stats?.totalEntreprises ?? 0 },
    { Indicateur: "Offres publiées", Valeur: stats?.offresPubliees ?? 0 },
    { Indicateur: "Total offres", Valeur: stats?.totalOffres ?? 0 },
    { Indicateur: "Total candidatures", Valeur: stats?.totalCandidatures ?? 0 },
    { Indicateur: "Candidatures acceptées", Valeur: stats?.candidaturesAcceptees ?? 0 },
    { Indicateur: "Taux acceptation (%)", Valeur: stats?.totalCandidatures > 0
        ? Math.round(stats.candidaturesAcceptees / stats.totalCandidatures * 100) : 0 },
    ...((avancees?.parFiliere || []).filter((f: any) => f.filiere).map((f: any) => ({
      Indicateur: `Étudiants filière ${f.filiere}`, Valeur: f.nombre
    }))),
    ...((avancees?.parNiveau || []).map((n: any) => ({
      Indicateur: `Étudiants niveau ${n.niveau}`, Valeur: n.nombre
    }))),
  ];
  exportCSV(lignes, `rapport_insertion_UNCHK_${new Date().getFullYear()}`);
}
