import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../../components/common/Spinner';
import * as aiService from '../../services/aiService';
import documentService from '../../services/documentService';

const ChatPage = () => {
  const { id } = useParams();
  const bottomRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const [documentResponse, historyResponse] = await Promise.all([
          documentService.getDocumentById(id),
          aiService.getChatHistory(id),
        ]);

        setDocument(documentResponse?.data || documentResponse);
        setMessages(Array.isArray(historyResponse?.data) ? historyResponse.data : []);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load chat.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChat();
    }
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: trimmedQuestion,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion('');

    try {
      setSending(true);
      const response = await aiService.chat(id, trimmedQuestion);
      const answer = response?.data?.answer || response?.answer || 'No answer returned.';

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to send message.');
      console.error(error);
    } finally {
      setSending(false);
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
    <div className="flex h-[calc(100vh-7rem)] flex-col px-6 py-8 lg:px-10">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`/documents/${id}`} className="inline-flex items-center gap-2 text-sm text-[#CBD5E1] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to document
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Chat with AI</h1>
          <p className="mt-1 max-w-2xl truncate text-sm text-[#CBD5E1]/60">
            {document?.title || 'Ask questions based on this document'}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] shadow-xl shadow-black/20 backdrop-blur-lg">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-4">
                <MessageSquare className="h-10 w-10 text-[#CBD5E1]/40" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Start a document chat</h2>
              <p className="mt-1 text-sm text-[#CBD5E1]/60">
                Ask anything about the uploaded content.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <div key={`${message.timestamp || index}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[min(760px,85%)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#FF8C32] text-[#06142D]'
                        : 'bg-[rgba(255,255,255,0.07)] text-[#CBD5E1]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-3 border-t border-[rgba(255,255,255,0.08)] p-4">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question about this document..."
            className="min-w-0 flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-[#CBD5E1]/50 focus:border-[#FF8C32]"
          />
          <button
            type="submit"
            disabled={sending || !question.trim()}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] text-[#06142D] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send message"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06142D] border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
