# 🧠 Lyra AI – Your Intelligent Learning Assistant

**Lyra AI** is a full-stack web application that leverages Generative AI (Google Gemini) to transform documents into interactive study tools. Users can upload PDFs, generate summaries, create flashcards, take AI-generated quizzes, and chat with their documents using a RAG (Retrieval-Augmented Generation) system.

> 🚀 **Live Demo:** https://get-lyra.vercel.app

---

## ✨ Key Features

- **📄 Document Upload & Processing:** Upload PDF documents. The system extracts text and processes it for AI analysis.
- **🤖 AI-Powered Summarization:** Automatically generates concise, structured summaries of uploaded documents using Google Gemini.
- **🃏 Smart Flashcards:** Transforms document content into educational flashcards with adjustable difficulty levels.
- **📝 AI-Generated Quizzes:** Creates multiple-choice quizzes from document content with a user-selectable number of questions.
- **💬 Context-Aware Chat (RAG):** Ask questions about your document. The system retrieves the most relevant text chunks and answers using Gemini, providing accurate, context-based responses.
- **📊 Progress Dashboard:** A centralized view of your learning statistics, including total documents, flashcards, quizzes, and average quiz scores.
- **⏱️ Timed Quiz Mode:** Practice under pressure with an auto-submitting timer (configurable seconds per question).
- **🎨 Modern UI:** Sleek, responsive dark-mode interface featuring **Glassmorphism** design with a Navy Blue & Orange color palette.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **State Management:** React Context API (Auth)
- **HTTP Client:** Axios (with interceptors)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash Lite)
- **File Uploads:** Multer (Local storage for development)
- **Validation:** Express Validator

---
