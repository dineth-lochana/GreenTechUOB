import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import './Learn.css';

const Learn = () => {
  const [disaster, setDisaster] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = [
    "Solar Systems",
    "Fire Detection & Protection Systems",
    "Variable Drives"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const questionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsList);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch questions'
      });
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.trim() || !selectedCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please enter a question and select a category'
      });
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        Data: newQuestion,
        category: selectedCategory,
        createdAt: new Date().toISOString()
      });

      setNewQuestion("");
      setSelectedCategory("");
      fetchQuestions();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Question added successfully'
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add question'
      });
    }
  };

  const updateQuestion = async (id, newData, category) => {
    try {
      await updateDoc(doc(db, "questions", id), {
        Data: newData,
        category: category
      });
      setEditingId(null);
      fetchQuestions();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Question updated successfully'
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update question'
      });
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "questions", id));
        await fetchQuestions();
        Swal.fire({
          title: 'Deleted!',
          text: 'Question has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete question. Please try again.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const getFilteredQuestions = () => {
    if (filterCategory === "all") return questions;
    return questions.filter(question => question.category === filterCategory);
  };

  async function generateAnswer(e) {
    e.preventDefault();
    if (!disaster || !questionType) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a product category and what you want to know.'
      });
      return;
    }

    setGeneratingAnswer(true);
    setAnswer("Loading your answer...");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ 
                text: `Provide a brief, clear explanation about ${questionType} of ${disaster}. 
                       Format the response in 3-4 short paragraphs maximum.` 
              }] 
            }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
          }),
        }
      );

      const data = await response.json();
      const answerData = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setAnswer(answerData || "No answer found for this specific question.");
    } catch {
      setAnswer("Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
  }

  return (
    <div className="learn-container">
      <motion.div 
        className="learn-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="title">AI Education Portal</h1>
        <form onSubmit={generateAnswer} className="form">
          <div className="form-group">
            <label>Select Product Category:</label>
            <select value={disaster} onChange={(e) => setDisaster(e.target.value)} className="select-input">
              <option value="">Choose...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select what you want to know:</label>
            <select 
              value={questionType} 
              onChange={(e) => setQuestionType(e.target.value)}
              className="select-input"
              disabled={!disaster}
            >
              <option value="">Choose...</option>
              {questions.filter(q => q.category === disaster).map(q => (
                <option key={q.id} value={q.Data}>{q.Data}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={generatingAnswer}>
            {generatingAnswer ? "Generating..." : "Generate Answer"}
          </button>
        </form>

        {answer && <div className="answer-card">{answer}</div>}
      </motion.div>
    </div>
  );
};

export default Learn;
