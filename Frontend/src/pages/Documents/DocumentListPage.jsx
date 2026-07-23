import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../../components/common/Spinner';
import DocumentCard from '../../components/documents/DocumentCard';
import documentService from '../../services/documentService';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocuments();
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load documents.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return documents;
    }

    return documents.filter((doc) => {
      const title = doc.title || '';
      const fileName = doc.fileName || '';

      return title.toLowerCase().includes(query) || fileName.toLowerCase().includes(query);
    });
  }, [documents, searchTerm]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this document'}"?`)) {
      return;
    }

    try {
      await documentService.deleteDocument(id);
      setDocuments((currentDocs) => currentDocs.filter((doc) => doc._id !== id));
      toast.success('Document deleted successfully.');
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to delete document.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Documents</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            Manage and view all your uploaded learning materials.
          </p>
        </div>

        <Link
          to="/documents/upload"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-5 py-2.5 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition-all duration-300 hover:shadow-[#FF8C32]/50 hover:brightness-105"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          New Document
        </Link>
      </div>

      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search documents by title or filename..."
          className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345]/60 py-3.5 pl-12 pr-4 text-base text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#CBD5E1]/60 focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]"
        />
      </div>

      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-6 py-20 text-center backdrop-blur-sm">
          <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-4 backdrop-blur-sm">
            <FileText className="h-12 w-12 text-[#CBD5E1]/40" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No documents found</h3>
          <p className="mt-1 text-sm text-[#CBD5E1]/60">
            {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
