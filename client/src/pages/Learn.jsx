// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
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
// eslint-disable-next-line no-unused-vars
  const [userEmail, setUserEmail] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = [
    "Solar Systems",
    "Fire Detection & Protection Systems",
    "Variable Drives"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
      }
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update question'
      });
    }
  };

  const deleteQuestion = async (id) => {
    try {
      // First show confirmation dialog
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
  
      // If user clicked confirm
      if (result.isConfirmed) {
        // Delete from Firebase
        await deleteDoc(doc(db, "questions", id));
        
        // Fetch updated questions
        await fetchQuestions();
        
        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Question has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete question. Please try again.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };


    // Filter questions based on selected disaster category
    const filteredQuestions = questions.filter(
      question => question.category === disaster
    );

    
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ 
                text: `Provide a brief, clear explanation about ${questionType} of ${disaster}. 
                       Format the response in 3-4 short paragraphs maximum. 
                       Use simple language and avoid technical jargon where possible.
                       Focus on the most important points only.` 
              }] 
            }],
            generationConfig: {
              maxOutputTokens: 250,
              temperature: 0.7,
            }
          }),
        }
      );

      const data = await response.json();
      const answerData = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!answerData) {
        setAnswer("No answer found for this specific question.");
        return;
      }

      const formattedAnswer = formatAnswer(answerData);
      setAnswer(formattedAnswer);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAnswer("Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
  }

  const getFilteredQuestions = () => {
    if (filterCategory === "all") {
      return questions;
    }
    return questions.filter(question => question.category === filterCategory);
  };

  function formatAnswer(answerText) {
    // Split by paragraphs (double newlines or single newlines)
    const paragraphs = answerText
      .split(/\n\n|\n/)
      .filter(para => para.trim().length > 0);

    return (
      <div className="formatted-answer">
        {paragraphs.map((para, index) => (
          <motion.p 
            key={index}
            className="answer-paragraph"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {para.trim()}
          </motion.p>
        ))}
      </div>
    );
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
          <label htmlFor="disasterSelect">Select Product Category:</label>
          <motion.select
            whileTap={{ scale: 0.98 }}
            id="disasterSelect"
            value={disaster}
            onChange={(e) => {
              setDisaster(e.target.value);
              setQuestionType(""); // Reset question selection when category changes
            }}
            className="select-input"
          >
            <option value="">Choose...</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </motion.select>
        </div>

        <div className="form-group">
          <label htmlFor="questionTypeSelect">Select what you want to know:</label>
          <motion.select
            whileTap={{ scale: 0.98 }}
            id="questionTypeSelect"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="select-input"
            disabled={!disaster}
          >
            <option value="">Choose...</option>
            {filteredQuestions.map(question => (
              <option key={question.id} value={question.Data}>
                {question.Data}
              </option>
            ))}
          </motion.select>
        </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="submit-button"
            disabled={generatingAnswer}
          >
            {generatingAnswer ? (
              <motion.div
                className="loading-dots"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Generating...
              </motion.div>
            ) : (
              'Generate Answer'
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {answer && (
            <motion.div 
              className="answer-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="answer-content">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn && (
          <motion.div 
            className="question-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Question Management</h2>
            <div className="add-question">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter new question"
                className="question-input"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addQuestion}
                className="add-button"
              >
                Add Question
              </motion.button>
            </div>
            
            <div className="filter-section">
              <label htmlFor="categoryFilter">Filter by Category:</label>
              <select
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="filter-stats">
                Showing {getFilteredQuestions().length} of {questions.length} questions
              </div>
            </div>

            <div className="questions-list">
              {getFilteredQuestions().map(question => (
                <motion.div 
                  key={question.id} 
                  className="question-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {editingId === question.id ? (
                    <div className="edit-container">
                      <select
                        defaultValue={question.category}
                        onChange={(e) => {
                          updateQuestion(question.id, question.Data, e.target.value);
                        }}
                        className="category-select"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        defaultValue={question.Data}
                        onBlur={(e) => updateQuestion(question.id, e.target.value, question.category)}
                        className="edit-input"
                      />
                    </div>
                  ) : (
                    <div className="question-info">
                      <span className="category-tag">{question.category}</span>
                      <span>{question.Data}</span>
                    </div>
                  )}
                  <div className="question-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingId(question.id)}
                      className="edit-button"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteQuestion(question.id)}
                      className="delete-button"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Learn;