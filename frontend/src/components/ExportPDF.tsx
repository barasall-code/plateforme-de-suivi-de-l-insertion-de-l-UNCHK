import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportStats {
  titre: string;
  sousTitre?: string;
  stats?: { label: string; valeur: string | number; couleur?: string }[];
  tableaux?: {
    titre: string;
    colonnes: string[];
    lignes: (string | number)[][];
  }[];
}

export function genererPDF({ titre, sousTitre, stats, tableaux }: ExportStats) {
  const doc = new jsPDF();
  const VERT = [27, 107, 58] as [number, number, number];
  const VERT_CLAIR = [212, 237, 218] as [number, number, number];
  const GRIS = [100, 100, 100] as [number, number, number];

  // En-tête
  doc.setFillColor(...VERT);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UNCHK', 14, 15);
  doc.setFontSize(13);
  doc.text(titre, 14, 25);
  if (sousTitre) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(sousTitre, 14, 32);
  }

  // Date export
  doc.setTextColor(...GRIS);
  doc.setFontSize(9);
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Exporté le ${date}`, 14, 45);

  let y = 52;

  // Statistiques en cartes
  if (stats && stats.length > 0) {
    doc.setTextColor(...VERT);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques', 14, y);
    y += 6;

    const colWidth = (210 - 28 - (stats.length - 1) * 4) / Math.min(stats.length, 4);
    stats.forEach((stat, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 14 + col * (colWidth + 4);
      const cardY = y + row * 22;

      doc.setFillColor(...VERT_CLAIR);
      doc.roundedRect(x, cardY, colWidth, 18, 2, 2, 'F');
      doc.setTextColor(...VERT);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(stat.valeur), x + colWidth / 2, cardY + 10, { align: 'center' });
      doc.setTextColor(...GRIS);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + colWidth / 2, cardY + 15, { align: 'center' });
    });

    y += Math.ceil(stats.length / 4) * 22 + 8;
  }

  // Tableaux
  if (tableaux && tableaux.length > 0) {
    tableaux.forEach((tableau) => {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setTextColor(...VERT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(tableau.titre, 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [tableau.colonnes],
        body: tableau.lignes.map(l => l.map(String)),
        headStyles: { fillColor: VERT, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        styles: { cellPadding: 4 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...VERT);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('© 2026 UNCHK — Plateforme de Suivi d\'Insertion Professionnelle', 14, 292);
    doc.text(`Page ${i} / ${pageCount}`, 196, 292, { align: 'right' });
  }

  return doc;
}

interface BoutonExportProps {
  onClick: () => void;
  label?: string;
  small?: boolean;
}

export default function BoutonExport({ onClick, label = 'Exporter PDF', small = false }: BoutonExportProps) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}>
      📄 {label}
    </button>
  );
}