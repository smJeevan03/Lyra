import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/documentService';

const DocumentUploadPage = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setError('');

    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setFile(null);
      setError('Only PDF files are allowed.');
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a document title.');
      return;
    }

    if (!file) {
      setError('Please choose a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', trimmedTitle);
    formData.append('file', file);

    try {
      setError('');
      setLoading(true);
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded successfully.');
      navigate('/documents');
    } catch (err) {
      const message = err.error || err.message || 'Failed to upload document.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">New Document</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            Upload a PDF to generate summaries, flashcards, and quizzes.
          </p>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm font-semibold text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.09)] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Documents
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)]">
            <FileText className="h-6 w-6 text-[#FF8C32]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create document</h2>
            <p className="text-sm text-[#CBD5E1]/70">PDF files up to 10 MB are supported.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-[#CBD5E1]">
              Document title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Machine Learning Chapter 1"
              disabled={loading}
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345]/60 px-4 py-3.5 text-base text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#CBD5E1]/60 focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]"
            />
          </div>

          <div>
            <label htmlFor="file" className="mb-2 block text-sm font-semibold text-[#CBD5E1]">
              PDF file
            </label>
            <label
              htmlFor="file"
              className={`flex cursor-pointer rounded-2xl border bg-[#0B2345]/40 px-6 transition hover:border-[#FF8C32]/70 hover:bg-[#0B2345]/60 ${
                file
                  ? 'items-center justify-between gap-4 border-[#FF8C32]/40 py-5 text-left'
                  : 'flex-col items-center justify-center border-dashed border-[rgba(255,255,255,0.16)] py-10 text-center'
              }`}
            >
              {file ? (
                <>
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FF8C32]/30 bg-[#FF8C32]/10">
                      <FileText className="h-6 w-6 text-[#FF8C32]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                      <p className="mt-1 text-xs text-[#CBD5E1]/60">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB selected. Click to replace.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      handleRemoveFile();
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#CBD5E1]/70 transition hover:bg-red-500/20 hover:text-red-300"
                    aria-label="Remove selected file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-[#FF8C32]" />
                  <span className="mt-3 text-sm font-semibold text-white">Choose a PDF file</span>
                  <span className="mt-1 text-xs text-[#CBD5E1]/60">
                    Click to browse from your computer.
                  </span>
                </>
              )}
              <input
                id="file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="sr-only"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-5 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06142D]/30 border-t-[#06142D]" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Create Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadPage;
