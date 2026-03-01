import api from './api';

export interface Candidature {
  id: string;
  statut: string;
  dateCandidature: string;
  lettreMotivation: string;
  cvUrl: string;
  commentaireEntreprise?: string;
  offre: {
    titre: string;
    typeOffre: string;
    localisation: string;
    entreprise: {
      nomEntreprise: string;
    };
  };
}

export async function getMesCandidatures(): Promise<Candidature[]> {
  const response = await api.get('/candidatures/mes-candidatures');
  return response.data.data;
}

export async function retirerCandidature(id: string): Promise<void> {
  await api.delete(`/candidatures/${id}`);
}
