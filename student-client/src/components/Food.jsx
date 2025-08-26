import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useCurrentUser from '../hooks/useCurrentUser';
import { Utensils, Star, MessageSquare } from 'lucide-react';

const Food = () => {
    const { user, loading: userLoading } = useCurrentUser();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('menu');
    
    // Feedback form state
    const [mealType, setMealType] = useState('breakfast');
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [feedbackHistory, setFeedbackHistory] = useState([]);

    useEffect(() => {
        fetchTodayMenu();
        if (!userLoading && user?.rollNumber) {
            fetchFeedbackHistory();
        }
    }, [user?.rollNumber, userLoading]);

    const fetchTodayMenu = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/student/menu/today`);
            setMenu(response.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("No menu has been set for today.");
            } else {
                setError("Failed to load today's menu. Please try again later.");
            }
            setMenu(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedbackHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/student/feedback/${user.rollNumber}`);
            setFeedbackHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch feedback history:", err);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError("You must be logged in to submit feedback.");
            return;
        }
        
        try {
            setSubmitting(true);
            
            const feedbackData = {
                studentId: user.rollNumber,
                studentName: user.name,
                mealType,
                rating: parseInt(rating),
                feedback
            };
            
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/food-api/student/feedback`, feedbackData);
            
            setSubmitSuccess(true);
            setFeedback('');
            fetchFeedbackHistory();
            
            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
            
        } catch (err) {
            setError("Failed to submit feedback. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Styles
    const styles = {
        container: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        tabContainer: {
            display: 'flex',
            borderBottom: '1px solid #ddd',
            marginBottom: '2rem'
        },
        tab: {
            padding: '1rem 2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '3px solid transparent',
            transition: 'all 0.3s ease'
        },
        activeTab: {
            borderBottom: '3px solid #0D6EFD',
            fontWeight: 'bold',
            color: '#0D6EFD'
        },
        menuCard: {
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '2rem',
            marginBottom: '2rem'
        },
        mealSection: {
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        },
        mealTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#0D6EFD'
        },
        feedbackForm: {
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '2rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500'
        },
        select: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '1rem'
        },
        ratingContainer: {
            display: 'flex',
            gap: '0.5rem'
        },
        starButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: '#ccc',
            transition: 'color 0.2s ease'
        },
        activeStar: {
            color: '#FFD700'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '1rem',
            minHeight: '100px',
            resize: 'vertical'
        },
        submitButton: {
            backgroundColor: '#0D6EFD',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
        },
        disabledButton: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed'
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '1rem'
        },
        errorMessage: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '1rem'
        },
        historyCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid #ddd'
        },
        historyHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
        },
        historyMealType: {
            textTransform: 'capitalize',
            fontWeight: '500'
        },
        historyRating: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#FFD700'
        },
        historyDate: {
            color: '#6c757d',
            fontSize: '0.875rem'
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
        }
    };

    const renderStarRating = (value) => {
        return (
            <div style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        style={{
                            ...styles.starButton,
                            ...(star <= rating ? styles.activeStar : {})
                        }}
                        onClick={() => setRating(star)}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Utensils size={28} />
                    Hostel Food Services
                </h2>
                <p>View today's menu and provide your valuable feedback</p>
            </div>

            <div style={styles.tabContainer}>
                <div
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'menu' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('menu')}
                >
                    <Utensils size={18} />
                    Today's Menu
                </div>
                <div
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'feedback' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('feedback')}
                >
                    <Star size={18} />
                    Provide Feedback
                </div>
            </div>

            {activeTab === 'menu' && (
                <div>
                    {loading ? (
                        <div style={styles.loadingSpinner}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div style={styles.errorMessage}>{error}</div>
                    ) : menu ? (
                        <div style={styles.menuCard}>
                            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                Menu for {formatDate(menu.date)}
                            </h3>

                            <div style={styles.mealSection}>
                                <div style={styles.mealTitle}>
                                    <span>🌅</span> Breakfast
                                </div>
                                <p>{menu.breakfast}</p>
                            </div>

                            <div style={styles.mealSection}>
                                <div style={styles.mealTitle}>
                                    <span>🌞</span> Lunch
                                </div>
                                <p>{menu.lunch}</p>
                            </div>

                            {menu.snacks && (
                                <div style={styles.mealSection}>
                                    <div style={styles.mealTitle}>
                                        <span>🍪</span> Snacks
                                    </div>
                                    <p>{menu.snacks}</p>
                                </div>
                            )}

                            <div style={styles.mealSection}>
                                <div style={styles.mealTitle}>
                                    <span>🌙</span> Dinner
                                </div>
                                <p>{menu.dinner}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.errorMessage}>No menu available for today.</div>
                    )}
                </div>
            )}

            {activeTab === 'feedback' && (
                <div>
                    <div style={styles.feedbackForm}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Share Your Feedback</h3>

                        {submitSuccess && (
                            <div style={styles.successMessage}>
                                Your feedback has been submitted successfully!
                            </div>
                        )}

                        {error && <div style={styles.errorMessage}>{error}</div>}

                        <form onSubmit={handleSubmitFeedback}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Select Meal</label>
                                <select
                                    style={styles.select}
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value)}
                                    required
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="snacks">Snacks</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rating</label>
                                {renderStarRating(rating)}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Comments (Optional)</label>
                                <textarea
                                    style={styles.textarea}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your thoughts about the food..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    ...styles.submitButton,
                                    ...(submitting ? styles.disabledButton : {})
                                }}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>

                    {feedbackHistory.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Your Recent Feedback</h3>
                            
                            {feedbackHistory.slice(0, 5).map((item) => (
                                <div key={item._id} style={styles.historyCard}>
                                    <div style={styles.historyHeader}>
                                        <span style={styles.historyMealType}>{item.mealType}</span>
                                        <span style={styles.historyRating}>
                                            {item.rating} <Star size={16} fill="#FFD700" />
                                        </span>
                                    </div>
                                    {item.feedback && <p>{item.feedback}</p>}
                                    <div style={styles.historyDate}>
                                        {formatDate(item.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Food;
