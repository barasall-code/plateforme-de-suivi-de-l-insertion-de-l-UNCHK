import api from './api';

export interface Offre {
  id: string;
  titre: string;
  description: string;
  typeOffre: string;
  domaine: string;
  niveauRequis: string;
  localisation: string;
  modeTravail: string;
  salaireMin?: number;
  salaireMax?: number;
  dureeMois?: number;
  dateLimiteCandidature: string;
  datePublication?: string;
  statut: string;
  entreprise: {
    nomEntreprise: string;
    secteurActivite: string;
    logoUrl?: string;
    siteWeb?: string;
  };
}

export interface FiltresOffres {
  search?: string;
  typeOffre?: string;
  modeTravail?: string;
  niveauRequis?: string;
  page?: number;
}

export async function getOffres(filtres: FiltresOffres = {}) {
  const params = new URLSearchParams();
  if (filtres.search) params.append('search', filtres.search);
  if (filtres.typeOffre) params.append('typeOffre', filtres.typeOffre);
  if (filtres.modeTravail) params.append('modeTravail', filtres.modeTravail);
  if (filtres.niveauRequis) params.append('niveauRequis', filtres.niveauRequis);
  if (filtres.page) params.append('page', String(filtres.page));

  const response = await api.get(`/offres?${params.toString()}`);
  return response.data.data;
}

export async function getOffreById(id: string) {
  const response = await api.get(`/offres/${id}`);
  return response.data.data;
}

export async function postuler(offreId: string, data: { lettreMotivation: string; cvUrl: string }) {
  const response = await api.post('/candidatures', { offreId, ...data });
  return response.data.data;
}