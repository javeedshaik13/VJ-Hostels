import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import useCurrentUser from '../hooks/useCurrentUser';
import FoodPauseManager from './FoodPauseManager';
import FoodScheduleViewer, { getTodaysMenuFromSchedule } from './FoodScheduleViewer';
import '../styles/Food.css';

// Meal timings (24hr format)
const mealTimings = {
    breakfast: { start: "07:00", end: "09:00" },
    lunch: { start: "12:30", end: "14:00" },
    snacks: { start: "16:30", end: "18:30" },
    dinner: { start: "19:30", end: "21:00" }
};

// Helper to get status and color
const getMealStatus = (meal) => {
    const now = new Date();
    const [startH, startM] = mealTimings[meal].start.split(":").map(Number);
    const [endH, endM] = mealTimings[meal].end.split(":").map(Number);

    const start = new Date(now);
    start.setHours(startH, startM, 0, 0);
    const end = new Date(now);
    end.setHours(endH, endM, 0, 0);

    const last30 = new Date(end.getTime() - 30 * 60000);

    if (now < start) return { color: "gray", status: "Not started" };
    if (now >= start && now < last30) return { color: "green", status: "Started" };
    if (now >= last30 && now < end) return { color: "orange", status: "Ending soon" };
    if (now >= end) return { color: "red", status: "Ended" };
};

// Blinking light component
const BlinkingLight = ({ color }) => (
    <span
        className="blinking-light"
        style={{
            background: color,
            animation: color !== 'gray' ? 'blink 1s infinite' : 'none',
            boxShadow: color !== 'gray' ? `0 0 8px 2px ${color}` : 'none'
        }}
    />
);

const Food = () => {
    const { user, loading: userLoading } = useCurrentUser();
    // Weekly food schedule (admin JSON data)
    const weeklyMenu = [
        {
            weekday: "Monday",
            breakfast: "Idli, Sambar, Chutney",
            lunch: "Rice, Dal, Paneer Curry, Salad",
            snacks: "Samosa, Tea",
            dinner: "Chapati, Mixed Veg Curry, Curd"
        },
        {
            weekday: "Tuesday",
            breakfast: "Poha, Chutney",
            lunch: "Jeera Rice, Rajma, Salad",
            snacks: "Biscuits, Coffee",
            dinner: "Roti, Aloo Gobi, Raita"
        },
        {
            weekday: "Wednesday",
            breakfast: "Upma, Chutney",
            lunch: "Rice, Chole, Salad",
            snacks: "Pakora, Tea",
            dinner: "Chapati, Bhindi Masala, Curd"
        },
        {
            weekday: "Thursday",
            breakfast: "Dosa, Chutney",
            lunch: "Rice, Sambar, Potato Fry",
            snacks: "Cake, Coffee",
            dinner: "Roti, Mixed Veg, Raita"
        },
        {
            weekday: "Friday",
            breakfast: "Paratha, Curd",
            lunch: "Rice, Dal Makhani, Salad",
            snacks: "Chips, Tea",
            dinner: "Chapati, Paneer Butter Masala, Curd"
        },
        {
            weekday: "Saturday",
            breakfast: "Puri, Aloo Bhaji",
            lunch: "Veg Biryani, Raita",
            snacks: "Mixture, Coffee",
            dinner: "Roti, Gobi Masala, Curd"
        },
        {
            weekday: "Sunday",
            breakfast: "Bread, Butter, Jam",
            lunch: "Rice, Dal Fry, Salad",
            snacks: "Fruit Salad, Tea",
            dinner: "Chapati, Veg Korma, Curd"
        }
    ];

    // Get today's weekday name
    const today = new Date();
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayWeekday = weekdayNames[today.getDay()];
    // Memoize today's menu to avoid flickering
    const menu = useMemo(() => {
        const foundMenu = weeklyMenu.find(menu => menu.weekday === todayWeekday);
        if (foundMenu) {
            return { ...foundMenu, date: new Date().toISOString() };
        }
        return { ...weeklyMenu[0], date: new Date().toISOString() };
    }, [todayWeekday]);

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('menu');
    // Feedback form state
    const [mealType, setMealType] = useState('breakfast');
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Add blinking animation to document head (once)
    useEffect(() => {
        if (!document.getElementById('blink-keyframes')) {
            const style = document.createElement('style');
            style.id = 'blink-keyframes';
            style.innerHTML = `
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            // This part is now effectively overridden by the local dummy data for display.
            // You can keep it for when you want to switch back to live data.
            // const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/student/menu/week`);
            // setSchedule(response.data);
            // const todaysMenu = getTodaysMenuFromSchedule(response.data);
            // setMenu(todaysMenu);
            // setError(todaysMenu ? null : "No menu has been set for today.");
        } catch (err) {
            let errorMsg = "Failed to load menu schedule. Please try again later.";
            if (err.response && err.response.data && err.response.data.message) {
                errorMsg += `\nDetails: ${err.response.data.message}`;
            } else if (err.message) {
                errorMsg += `\nDetails: ${err.message}`;
            }
            setError(errorMsg);
            // setMenu(null); // We are using local menu, so we don't nullify it on error.
        } finally {
            setLoading(false);
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

    const renderStarRating = () => {
        return (
            <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-button ${star <= rating ? 'active-star' : ''}`}
                        onClick={() => setRating(star)}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="food-container">
            <div className="food-header">
                <h2>Hostel Food Menu & Feedback</h2>
            </div>
            <div className="tab-container">
                <div
                    className={`tab ${activeTab === 'menu' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('menu')}
                >
                    <i className="bi bi-list"></i> Today's Menu
                </div>
                <div
                    className={`tab ${activeTab === 'feedback' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('feedback')}
                >
                    <i className="bi bi-chat-dots"></i> Feedback
                </div>
                <div
                    className={`tab ${activeTab === 'schedule' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    <i className="bi bi-calendar-week"></i> Meal Schedule
                </div>
                <div
                    className={`tab ${activeTab === 'pause' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('pause')}
                >
                    <i className="bi bi-pause-circle"></i> Pause Service
                </div>
            </div>
            {/*menu tab*/}
            {activeTab === 'menu' && (
                <div>
                    {menu ? (
                        <div className="menu-card">
                            <h3>
                               Today's Menu {formatDate(menu.date)}
                            </h3>
                            <div className='card' style={{border: '1px solid whitesmoke',boxShadow: '0 4px 12px rgba(0,0,0,0.5)', padding: '1rem',borderRadius: '10px'}}>
                                <div className="meal-section">
                                    <div className='card' style={{border: '1px solid whitesmoke',boxShadow: '0 4px 12px rgba(0,0,0,0.4)', padding: '1rem',borderRadius: '10px'}} >
                                        <div className="meal-title">
                                            <BlinkingLight color={getMealStatus('breakfast').color} />
                                            Breakfast
                                        </div>
                                    <p>{menu.breakfast}</p>
                                    </div>
                                </div>
                                <div className="meal-section">
                                    <div className='card' style={{border: '1px solid whitesmoke',boxShadow: '0 4px 12px rgba(0,0,0,0.4)', padding: '1rem',borderRadius: '10px'}} >
                                    <div className="meal-title">
                                        <BlinkingLight color={getMealStatus('lunch').color} />
                                        Lunch
                                    </div>
                                    <p>{menu.lunch}</p>
                                </div>
                                </div>
                                {menu.snacks && (
                                    <div className="meal-section">
                                         <div className='card' style={{border: '1px solid whitesmoke',boxShadow: '0 4px 12px rgba(0,0,0,0.4)', padding: '1rem',borderRadius: '10px'}} >
                                        <div className="meal-title">
                                            <BlinkingLight color={getMealStatus('snacks').color} />
                                            Snacks
                                        </div>
                                        <p>{menu.snacks}</p>
                                    </div>
                                    </div>
                                )}
                                <div className="meal-section">
                                    <div className='card' style={{border: '1px solid whitesmoke',boxShadow: '0 4px 12px rgba(0,0,0,0.4)', padding: '1rem',borderRadius: '10px'}} >
                                    <div className="meal-title">
                                        <BlinkingLight color={getMealStatus('dinner').color} />
                                        Dinner
                                    </div>
                                    <p>{menu.dinner}</p>
                                </div>
                            </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error-message">No menu available for today.</div>
                    )}
                </div>
            )}
            {/* Feedback Form */}
            {activeTab === 'feedback' && (
                <form className="feedback-form" onSubmit={handleSubmitFeedback}>
                    {submitSuccess && (
                        <div className="success-message">
                            Feedback submitted successfully!
                        </div>
                    )}
                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Meal Type</label>
                        <select
                            className="form-select"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            disabled={submitting}
                        >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="snacks">Snacks</option>
                            <option value="dinner">Dinner</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rating</label>
                        {renderStarRating()}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Feedback</label>
                        <textarea
                            className="form-textarea"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            )}

            {activeTab === 'schedule' && (
                <FoodScheduleViewer />
            )}

            {activeTab === 'pause' && (
                <FoodPauseManager />
            )}
        </div>
    );
};

export default Food;