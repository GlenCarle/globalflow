import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import authService from '../lib/auth.service';

export default function PDFDownloadButton({ bookingId }) {
  const handleDownload = () => {
    // Get authentication token
    const tokens = authService.getTokens();
    if (!tokens || !tokens.access) {
      alert('Vous devez être connecté pour télécharger le PDF');
      return;
    }

    // Use the backend URL directly for PDF download
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
    const pdfUrl = `${backendUrl}travel/api/travel-bookings/${bookingId}/generate_pdf/`;

    // Create a temporary link with authorization header
    fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.access}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reservation_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    });
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      <Download className="h-4 w-4" />
      Télécharger le dossier PDF
    </Button>
  );
}
