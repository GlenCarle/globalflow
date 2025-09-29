import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/Select';
import { Progress } from '../ui/Progress';
import axios from '../../lib/axios';

const VisaApplicationStep3 = ({ application, visaTypes, onChange, formData }) => {
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Types de documents d'identité
  const idDocumentTypes = [
    { value: 'cni', label: 'Carte Nationale d\'Identité (CNI)' },
    { value: 'passport', label: 'Passeport' },
    { value: 'birth_certificate', label: 'Acte de naissance' },
    { value: 'receipt', label: 'Récépissé de demande de CNI/Passeport' }
  ];
  
  // Initialiser les états des fichiers
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [passportFile, setPassportFile] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);
  
  // Suivi de l'état de complétion des documents
  const [documentsStatus, setDocumentsStatus] = useState({
    idDocument: { uploaded: false, file: null },
    passport: { uploaded: false, file: null },
    birthCertificate: { uploaded: false, file: null }
  });
  
  // Calcul du pourcentage de complétion
  const completionPercentage = Math.round(
    (Object.values(documentsStatus).filter(doc => doc.uploaded).length / 
     Object.keys(documentsStatus).length) * 100
  );

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        if (application) {
          await Promise.all([
            loadDocuments(),
            loadRequiredDocuments()
          ]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Erreur lors du chargement des données des documents');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [application, visaTypes]);

  const loadDocuments = async () => {
    try {
      // Load application documents
      const appResponse = await axios.get(`/travel/api/visa-applications/${application.id}/`);
      const docs = appResponse.data.documents || [];
      setDocuments(docs);
      
      // Mettre à jour l'état des documents téléversés
      const newDocumentsStatus = { ...documentsStatus };
      
      // Vérifier les documents existants
      const idDoc = docs.find(doc => doc.document_type === 'id_document');
      if (idDoc) {
        newDocumentsStatus.idDocument = { 
          uploaded: true, 
          file: { name: idDoc.file.split('/').pop() || 'document_identite.pdf' } 
        };
        setIdDocumentFile({ name: idDoc.file.split('/').pop() || 'document_identite.pdf' });
      }
      
      const passportDoc = docs.find(doc => doc.document_type === 'passport');
      if (passportDoc) {
        newDocumentsStatus.passport = { 
          uploaded: true, 
          file: { name: passportDoc.file.split('/').pop() || 'passeport.pdf' } 
        };
        setPassportFile({ name: passportDoc.file.split('/').pop() || 'passeport.pdf' });
      }
      
      const birthCertDoc = docs.find(doc => doc.document_type === 'birth_certificate');
      if (birthCertDoc) {
        newDocumentsStatus.birthCertificate = { 
          uploaded: true, 
          file: { name: birthCertDoc.file.split('/').pop() || 'acte_naissance.pdf' } 
        };
        setBirthCertificateFile({ name: birthCertDoc.file.split('/').pop() || 'acte_naissance.pdf' });
      }
      
      setDocumentsStatus(newDocumentsStatus);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Erreur lors du chargement des documents');
    }
  };

  const loadRequiredDocuments = async () => {
    if (!application || !visaTypes.length) return;

    try {
      const visaType = visaTypes.find(v => v.id === application.visa_type);
      if (visaType) {
        // Load required documents for this visa type
        const response = await axios.get(`/travel/api/visa-types/${visaType.id}/required_documents/`);
        setRequiredDocuments(response.data);
      }
    } catch (error) {
      console.error('Error loading required documents:', error);
      setError('Erreur lors du chargement des documents requis');
    }
  };

  const handleFileUpload = async (documentId, file) => {
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers PDF et images (JPG, PNG) sont acceptés');
      return;
    }

    setUploading(prev => ({ ...prev, [documentId]: true }));
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Temporarily skip required_document to avoid NULL constraint error
      // TODO: Re-enable once database migration is applied
      // formData.append('required_document', documentId);
      formData.append('application', application.id);

      const response = await axios.post(
        `/travel/api/application-documents/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setDocuments(prev => [...prev, response.data]);
      setSuccess('Document téléversé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Erreur lors du téléversement du document');
    } finally {
      setUploading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleFileRemove = async (documentId) => {
    try {
      await axios.delete(`/travel/api/application-documents/${documentId}/`);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSuccess('Document supprimé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing document:', error);
      setError('Erreur lors de la suppression du document');
    }
  };

  const reviewDocument = async (documentId, status, notes = '') => {
    try {
      await axios.post(`/travel/api/application-documents/${documentId}/review/`, {
        status,
        notes
      });
      // Reload documents to get updated status
      loadDocuments();
    } catch (error) {
      console.error('Error reviewing document:', error);
      setError('Erreur lors de la validation du document');
    }
  };

  const handleIdDocumentTypeChange = async (value) => {
    onChange('id_document_type', value);
    
    // Update document status
    setDocumentsStatus(prev => ({
      ...prev,
      idDocument: { ...prev.idDocument, uploaded: false, file: null }
    }));
    
    // Remove any previously uploaded ID document
    const existingDoc = documents.find(doc => doc.document_type === 'id_document');
    if (existingDoc) {
      try {
        await axios.delete(`/travel/api/application-documents/${existingDoc.id}/`);
        setDocuments(prev => prev.filter(doc => doc.id !== existingDoc.id));
      } catch (error) {
        console.error('Error removing previous document:', error);
      }
    }
  };

  const handleIdDocumentFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input value to allow re-uploading the same file
    e.target.value = null;

    // File validation
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers PDF et images (JPG, PNG) sont acceptés');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, idDocument: true }));
      setError(null);
      
      // Create form data with all required fields
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'id_document');
      formData.append('application', application.id);
      
      // Add required document ID if available
      if (formData && formData.id_document_type) {
        const requiredDoc = requiredDocuments.find(doc =>
          doc.document_type === 'id_document'
        );
        if (requiredDoc) {
          formData.append('required_document', requiredDoc.id);
        }
      }
      
      // Upload the file
      const response = await axios.post(
        '/travel/api/application-documents/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update state with the uploaded document
      setDocuments(prev => [...prev, response.data]);
      setIdDocumentFile(file);
      setDocumentsStatus(prev => ({
        ...prev,
        idDocument: { ...prev.idDocument, uploaded: true, file }
      }));
      
      setSuccess('Document d\'identité téléversé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading ID document:', error);
      setError(error.response?.data?.error || 'Erreur lors du téléchargement du document d\'identité');
    } finally {
      setUploading(prev => ({ ...prev, idDocument: false }));
    }
  };

  const handlePassportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input value to allow re-uploading the same file
    e.target.value = null;

    // File validation
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers PDF et images (JPG, PNG) sont acceptés');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, passport: true }));
      setError(null);
      
      // Create form data with all required fields
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'passport');
      formData.append('application', application.id);
      
      // Add required document ID if available
      const requiredDoc = requiredDocuments.find(doc =>
        doc.document_type === 'passport'
      );
      if (requiredDoc) {
        formData.append('required_document', requiredDoc.id);
      }
      
      // Upload the file
      const response = await axios.post(
        '/travel/api/application-documents/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update state with the uploaded document
      setDocuments(prev => [...prev, response.data]);
      setPassportFile(file);
      setDocumentsStatus(prev => ({
        ...prev,
        passport: { ...prev.passport, uploaded: true, file }
      }));
      
      setSuccess('Passeport téléversé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading passport:', error);
      setError(error.response?.data?.error || 'Erreur lors du téléchargement du passeport');
    } finally {
      setUploading(prev => ({ ...prev, passport: false }));
    }
  };
  
  const handleBirthCertificateFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input value to allow re-uploading the same file
    e.target.value = null;

    // File validation
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers PDF et images (JPG, PNG) sont acceptés');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, birthCertificate: true }));
      setError(null);
      
      // Create form data with all required fields
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'birth_certificate');
      formData.append('application', application.id);
      
      // Add required document ID if available
      const requiredDoc = requiredDocuments.find(doc =>
        doc.document_type === 'birth_certificate'
      );
      if (requiredDoc) {
        formData.append('required_document', requiredDoc.id);
      }
      
      // Upload the file
      const response = await axios.post(
        '/travel/api/application-documents/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update state with the uploaded document
      setDocuments(prev => [...prev, response.data]);
      setBirthCertificateFile(file);
      setDocumentsStatus(prev => ({
        ...prev,
        birthCertificate: { ...prev.birthCertificate, uploaded: true, file }
      }));
      
      setSuccess('Acte de naissance téléversé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error uploading birth certificate:', error);
      setError(error.response?.data?.error || 'Erreur lors du téléchargement de l\'acte de naissance');
    } finally {
      setUploading(prev => ({ ...prev, birthCertificate: false }));
    }
  };
  
  const removeDocument = async (type) => {
    try {
      let documentType = '';
      
      // Trouver le document à supprimer en fonction du type
      let documentToDelete = null;
      if (type === 'idDocument') {
        documentType = 'id_document';
        documentToDelete = documents.find(doc => doc.document_type === 'id_document');
        setIdDocumentFile(null);
        setDocumentsStatus(prev => ({
          ...prev,
          idDocument: { ...prev.idDocument, uploaded: false, file: null }
        }));
      } else if (type === 'passport') {
        documentType = 'passport';
        documentToDelete = documents.find(doc => doc.document_type === 'passport');
        setPassportFile(null);
        setDocumentsStatus(prev => ({
          ...prev,
          passport: { ...prev.passport, uploaded: false, file: null }
        }));
      } else if (type === 'birthCertificate') {
        documentType = 'birth_certificate';
        documentToDelete = documents.find(doc => doc.document_type === 'birth_certificate');
        setBirthCertificateFile(null);
        setDocumentsStatus(prev => ({
          ...prev,
          birthCertificate: { ...prev.birthCertificate, uploaded: false, file: null }
        }));
      }
      
      // Supprimer le document du serveur s'il existe
      if (documentToDelete && documentToDelete.id) {
        await axios.delete(`/travel/api/application-documents/${documentToDelete.id}/`);
        setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
        setSuccess(`${documentType === 'id_document' ? 'Document d\'identité' : documentType === 'passport' ? 'Passeport' : 'Acte de naissance'} supprimé avec succès`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
      setError(`Erreur lors de la suppression du ${type === 'idDocument' ? 'document d\'identité' : type === 'passport' ? 'passeport' : 'de l\'acte de naissance'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Chargement des informations...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune demande trouvée</h3>
        <p className="text-gray-600 dark:text-gray-400">Impossible de charger les détails de la demande de visa.</p>
      </div>
    );
  }

  const visaType = visaTypes.find(v => v.id === application.visa_type);
  if (!visaType) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Type de visa non trouvé</h3>
        <p className="text-gray-600 dark:text-gray-400">Le type de visa associé à cette demande n'existe plus.</p>
      </div>
    );
  }

  // Vérifier si tous les documents obligatoires sont téléversés
  const isComplete = Object.values(documentsStatus).every(doc => doc.uploaded);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Téléversement des documents</h2>
        <p className="text-gray-600 dark:text-gray-400">Téléversez tous les documents requis pour votre demande de visa</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <div>{error}</div>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <div>{success}</div>
        </Alert>
      )}

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progression des documents</span>
          <span>{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Documents personnels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents personnels
          </CardTitle>
          <CardDescription>
            Téléversez les documents demandés. Tous les champs marqués d'un astérisque (*) sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type de document d'identité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de document d'identité *
            </label>
            <Select 
              value={formData?.id_document_type || ''} 
              onValueChange={handleIdDocumentTypeChange}
            >
              <SelectTrigger>
                {formData?.id_document_type ? (
                  idDocumentTypes.find(t => t.value === formData.id_document_type)?.label || 
                  'Sélectionnez un type de document'
                ) : 'Sélectionnez un type de document'}
              </SelectTrigger>
              <SelectContent>
                {idDocumentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Téléversement du document d'identité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document d'identité *
            </label>
            {!documentsStatus.idDocument.uploaded ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="id-document-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                    >
                      <span>Téléversez un fichier</span>
                      <input
                        id="id-document-upload"
                        name="id-document-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleIdDocumentFileChange}
                        onClick={(e) => {
                          // Reset the value to allow re-uploading the same file
                          e.target.value = null;
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        key={`id-document-${documentsStatus.idDocument.uploaded ? 'uploaded' : 'empty'}`}
                      />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, PNG jusqu'à 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {idDocumentFile?.name || 'Document téléversé'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                    onClick={() => {}}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                    onClick={() => removeDocument('idDocument')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Passeport (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passeport (si disponible)
            </label>
            {!documentsStatus.passport.uploaded ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="passport-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                    >
                      <span>Téléversez un fichier</span>
                      <input
                        id="passport-upload"
                        name="passport-upload"
                        type="file"
                        className="sr-only"
                        onChange={handlePassportFileChange}
                        onClick={(e) => {
                          // Reset the value to allow re-uploading the same file
                          e.target.value = null;
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        key={`passport-${documentsStatus.passport.uploaded ? 'uploaded' : 'empty'}`}
                      />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, PNG jusqu'à 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {passportFile?.name || 'Passeport téléversé'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                    onClick={() => {}}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                    onClick={() => removeDocument('passport')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Acte de naissance (obligatoire) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acte de naissance *
            </label>
            {!documentsStatus.birthCertificate.uploaded ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="birth-certificate-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                    >
                      <span>Téléversez un fichier</span>
                      <input
                        id="birth-certificate-upload"
                        name="birth-certificate-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleBirthCertificateFileChange}
                        onClick={(e) => {
                          // Reset the value to allow re-uploading the same file
                          e.target.value = null;
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        key={`birth-certificate-${documentsStatus.birthCertificate.uploaded ? 'uploaded' : 'empty'}`}
                      />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, PNG jusqu'à 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {birthCertificateFile?.name || 'Acte de naissance téléversé'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                    onClick={() => {}}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                    onClick={() => removeDocument('birthCertificate')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {idDocumentTypes && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document d'identité ({idDocumentTypes === 'birth_certificate' ? 'Acte de naissance' :
                  idDocumentTypes === 'cni' ? 'CNI' : 'Recepissé'}) *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Formats acceptés: PDF, JPG, PNG • Taille max: 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleIdDocumentFileChange}
                    className="hidden"
                    id="id-document-file"
                  />
                  <label htmlFor="id-document-file">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choisir un fichier
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passeport (facultatif)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Glissez-déposez votre passeport ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Formats acceptés: PDF, JPG, PNG • Taille max: 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handlePassportFileChange}
                    className="hidden"
                    id="passport-document-file"
                  />
                  <label htmlFor="passport-document-file">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choisir un fichier
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visa Type Documents List */}
      <div className="space-y-6">
        {requiredDocuments.map((reqDoc) => {
          const uploadedDoc = documents.find(doc => doc.required_document === reqDoc.id);

          return (
            <Card key={reqDoc.id} className={reqDoc.is_mandatory ? 'border-red-200 dark:border-red-800' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {reqDoc.name}
                      {reqDoc.is_mandatory && (
                        <span className="text-red-500 text-sm font-normal">(Obligatoire)</span>
                      )}
                    </CardTitle>
                    <CardDescription>{reqDoc.description}</CardDescription>
                  </div>
                  {uploadedDoc && (
                    <div className="flex items-center gap-2">
                      {uploadedDoc.status === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {uploadedDoc.status === 'rejected' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {uploadedDoc.status === 'pending' && (
                        <div className="h-5 w-5 rounded-full bg-yellow-400"></div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {uploadedDoc ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{uploadedDoc.file_name || 'Document'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Téléversé le {new Date(uploadedDoc.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadedDoc.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(uploadedDoc.file_url, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileRemove(uploadedDoc.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {uploadedDoc.status === 'rejected' && uploadedDoc.reviewer_notes && (
                      <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Document rejeté</p>
                          <p className="text-sm">{uploadedDoc.reviewer_notes}</p>
                        </div>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-400">
                          Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Formats acceptés: PDF, JPG, PNG • Taille max: 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(reqDoc.id, e.target.files[0])}
                        className="hidden"
                        id={`file-${reqDoc.id}`}
                        disabled={uploading[reqDoc.id]}
                      />
                      <label htmlFor={`file-${reqDoc.id}`}>
                        <Button
                          variant="outline"
                          className="mt-4"
                          disabled={uploading[reqDoc.id]}
                          asChild
                        >
                          <span>
                            {uploading[reqDoc.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                Téléversement...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir un fichier
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Progression des documents</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {documents.filter(doc => doc.status === 'approved').length} sur {requiredDocuments.length} documents validés
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {Math.round((documents.filter(doc => doc.status === 'approved').length / requiredDocuments.length) * 100)}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Complété</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card className={isComplete ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {isComplete ? 'Demande complète' : 'Demande incomplète'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isComplete
                    ? 'Tous les documents obligatoires ont été téléversés et approuvés'
                    : 'Certains documents obligatoires sont manquants ou non approuvés'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {isComplete ? 'Prêt à soumettre' : 'Documents requis manquants'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaApplicationStep3;