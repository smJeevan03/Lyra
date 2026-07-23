import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ExternalLink, 
  Edit, 
  Trash2 
} from 'lucide-react';

const DocumentCard = ({ 
  document, 
  onDelete, 
  onEdit,
  className = '' 
}) => {
  
  if (!document) return null;

  const { _id, title, fileName, status, lastAccessed, createdAt } = document;
  const isReady = status === 'ready';
  const statusLabel = status || 'processing';

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link 
      to={`/documents/${_id}`}
      className={`
        group relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 
        backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20 
        transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.02]
        ${className}
      `}
    >
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 opacity-0 bg-gradient-to-br from-[#FF8C32]/5 to-transparent transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        
        {/* Card Header: Icon + Status */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)]">
            <FileText className="h-6 w-6 text-[#CBD5E1]" strokeWidth={1.5} />
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider border ${
            isReady 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10' 
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/10'
          }`}>
            {isReady ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3 animate-spin-slow" />}
            {statusLabel}
          </div>
        </div>

        {/* Card Content */}
        <div>
          <h3 className="text-lg font-bold text-white truncate leading-tight group-hover:text-[#FFA74D] transition-colors">
            {title || 'Untitled Document'}
          </h3>
          <p className="mt-1 text-sm text-[#CBD5E1]/60 truncate">
            {fileName || 'No filename'}
          </p>
        </div>

        {/* Card Footer: Actions + Date */}
        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-4">
          <span className="text-[11px] text-[#CBD5E1]/40">
            {formatDate(lastAccessed || createdAt)}
          </span>
          
          <div className="flex items-center gap-1">
            {/* View Button */}
            <Link 
              to={`/documents/${_id}`} 
              className="rounded-lg p-1.5 text-[#CBD5E1]/40 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              aria-label="View document details"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            
            {/* Edit Button */}
            {onEdit && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(_id);
                }}
                className="rounded-lg p-1.5 text-[#CBD5E1]/40 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                aria-label="Edit document"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(_id, title);
                }}
                className="rounded-lg p-1.5 text-[#CBD5E1]/40 transition hover:bg-red-500/20 hover:text-red-400"
                aria-label="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;