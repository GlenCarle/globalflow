import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { FileUp, ArrowRight, ArrowLeft, Eye, X, Loader } from 'lucide-react';
import api from '../lib/axios';

export default function DocumentUpload({ bookingId, documents, setDocuments, onNext, onPrev }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('passport');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing documents when component mounts
  useEffect(() => {
    const loadDocuments = async () => {
      if (bookingId && documents.length === 0) {
        try {
          const res = await api.get(`/travel/api/travel-bookings/${bookingId}/documents/`);
          setDocuments(res.data || []);
        } catch (error) {
          console.error('Error loading documents:', error);
        }
      }
    };
    loadDocuments();
  }, [bookingId, documents.length, setDocuments]);

  const handleAddDocument = async () => {
    if (!file || !bookingId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('booking', bookingId);
      formData.append('type', type);
      formData.append('fichier', file);

      const res = await api.post('/travel/api/travel-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocuments([...documents, res.data]);
      setFile(null);
      setPreviewUrl(null);
      setType('passport');
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const openPreview = (doc) => {
    if (doc.fichier_url) {
      window.open(doc.fichier_url, '_blank');
    } else if (doc.fichier) {
      // For local files, create object URL
      const url = URL.createObjectURL(doc.fichier);
      window.open(url, '_blank');
    }
  };

  const removeDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <FileUp className="h-7 w-7 text-primary" />
        </span>
        <h2 className="text-2xl font-bold text-primary">Documents à fournir</h2>
      </div>

      {/* Existing Documents */}
      {documents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Documents téléversés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{doc.get_type_display || doc.type}</p>
                    <p className="text-sm text-gray-500">{doc.get_statut_display || doc.statut}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openPreview(doc)}
                    className="p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Type de document</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="passport">Passeport</option>
              <option value="visa">Visa</option>
              <option value="id_card">Carte d'identité</option>
              <option value="birth_certificate">Acte de naissance</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Fichier</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* File Preview */}
        {previewUrl && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Aperçu du fichier</h4>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {file?.type?.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="max-w-full h-48 object-contain mx-auto" />
              ) : (
                <div className="text-center py-8">
                  <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{file?.name}</p>
                  <p className="text-sm text-gray-400">PDF ou autre document</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-8">
          <Button type="button" onClick={onPrev} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <Button
            type="button"
            onClick={handleAddDocument}
            disabled={!file}
            className="flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Ajouter
          </Button>
          <Button type="button" onClick={onNext} className="flex items-center gap-2">
            Suivant <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
