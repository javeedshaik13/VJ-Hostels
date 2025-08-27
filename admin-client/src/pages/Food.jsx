import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import FoodCountManager from '../components/FoodCountManager';
import StudentFoodManager from '../components/StudentFoodManager';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Food = () => {
    const [activeTab, setActiveTab] = useState('menu');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAdmin();

    // Menu state
    const [menus, setMenus] = useState([]);
    const [menuFormData, setMenuFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: ''
    });
    const [menuFormLoading, setMenuFormLoading] = useState(false);
    const [menuFormSuccess, setMenuFormSuccess] = useState('');
    const [menuFormError, setMenuFormError] = useState('');

    // Feedback state
    const [feedback, setFeedback] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'menu') {
            fetchMenus();
        } else if (activeTab === 'feedback') {
            fetchFeedback();
            fetchFeedbackStats();
        }
    }, [activeTab, token]);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/admin/menus`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMenus(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load menus');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedback = async () => {
        try {
            setFeedbackLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/admin/feedback`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFeedback(response.data);
        } catch (err) {
            console.error('Failed to load feedback:', err);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const fetchFeedbackStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/food-api/admin/feedback/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFeedbackStats(response.data);
        } catch (err) {
            console.error('Failed to load feedback stats:', err);
        }
    };

    const handleMenuInputChange = (e) => {
        const { name, value } = e.target;
        setMenuFormData({
            ...menuFormData,
            [name]: value
        });
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        setMenuFormError('');
        setMenuFormSuccess('');
        setMenuFormLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/food-api/admin/menu`,
                menuFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMenuFormSuccess(response.data.message);
            fetchMenus();

            // Reset form except date
            setMenuFormData({
                date: menuFormData.date,
                breakfast: '',
                lunch: '',
                dinner: '',
                snacks: ''
            });

            setTimeout(() => {
                setMenuFormSuccess('');
            }, 3000);
        } catch (err) {
            setMenuFormError(err.response?.data?.message || 'Failed to save menu');
            console.error(err);
        } finally {
            setMenuFormLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Function to get color based on rating
    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'success';
        if (rating >= 3.5) return 'info';
        if (rating >= 2.5) return 'warning';
        return 'danger';
    };

    // Function to render stars based on rating
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className="d-inline-block">
                {[...Array(fullStars)].map((_, i) => (
                    <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
                ))}
                {halfStar && <i className="bi bi-star-half text-warning"></i>}
                {[...Array(emptyStars)].map((_, i) => (
                    <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Food Management</h2>
                <div className="btn-group">
                    <button
                        className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('menu')}
                    >
                        <i className="bi bi-calendar-week me-2"></i>
                        Menu Management
                    </button>
                    <button
                        className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('feedback')}
                    >
                        <i className="bi bi-star me-2"></i>
                        Feedback & Reviews
                    </button>
                    <button
                        className={`btn ${activeTab === 'count' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('count')}
                    >
                        <i className="bi bi-calculator me-2"></i>
                        Food Count
                    </button>
                    <button
                        className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        <i className="bi bi-people me-2"></i>
                        Student Management
                    </button>
                </div>
            </div>

            {activeTab === 'menu' && (
                <div className="row">
                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Create/Update Menu</h5>
                            </div>
                            <div className="card-body">
                                {menuFormError && (
                                    <div className="alert alert-danger" role="alert">
                                        {menuFormError}
                                    </div>
                                )}
                                {menuFormSuccess && (
                                    <div className="alert alert-success" role="alert">
                                        {menuFormSuccess}
                                    </div>
                                )}
                                <form onSubmit={handleMenuSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="date"
                                            name="date"
                                            value={menuFormData.date}
                                            onChange={handleMenuInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="breakfast" className="form-label">Breakfast</label>
                                        <textarea
                                            className="form-control"
                                            id="breakfast"
                                            name="breakfast"
                                            rows="2"
                                            value={menuFormData.breakfast}
                                            onChange={handleMenuInputChange}
                                            placeholder="Enter breakfast menu items"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lunch" className="form-label">Lunch</label>
                                        <textarea
                                            className="form-control"
                                            id="lunch"
                                            name="lunch"
                                            rows="2"
                                            value={menuFormData.lunch}
                                            onChange={handleMenuInputChange}
                                            placeholder="Enter lunch menu items"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="snacks" className="form-label">Snacks (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            id="snacks"
                                            name="snacks"
                                            rows="2"
                                            value={menuFormData.snacks}
                                            onChange={handleMenuInputChange}
                                            placeholder="Enter snacks menu items"
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="dinner" className="form-label">Dinner</label>
                                        <textarea
                                            className="form-control"
                                            id="dinner"
                                            name="dinner"
                                            rows="2"
                                            value={menuFormData.dinner}
                                            onChange={handleMenuInputChange}
                                            placeholder="Enter dinner menu items"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={menuFormLoading}
                                    >
                                        {menuFormLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : 'Save Menu'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Menu History</h5>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center my-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                ) : menus.length === 0 ? (
                                    <div className="alert alert-info" role="alert">
                                        No menus found. Create your first menu!
                                    </div>
                                ) : (
                                    <div className="accordion" id="menuAccordion">
                                        {menus.map((menu, index) => (
                                            <div className="accordion-item" key={menu._id}>
                                                <h2 className="accordion-header">
                                                    <button
                                                        className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapse${menu._id}`}
                                                        aria-expanded={index === 0 ? 'true' : 'false'}
                                                        aria-controls={`collapse${menu._id}`}
                                                    >
                                                        {formatDate(menu.date)}
                                                    </button>
                                                </h2>
                                                <div
                                                    id={`collapse${menu._id}`}
                                                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                    data-bs-parent="#menuAccordion"
                                                >
                                                    <div className="accordion-body">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="mb-3">
                                                                    <h6 className="fw-bold">
                                                                        <i className="bi bi-sunrise me-2 text-warning"></i>
                                                                        Breakfast
                                                                    </h6>
                                                                    <p>{menu.breakfast}</p>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <h6 className="fw-bold">
                                                                        <i className="bi bi-sun me-2 text-warning"></i>
                                                                        Lunch
                                                                    </h6>
                                                                    <p>{menu.lunch}</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                {menu.snacks && (
                                                                    <div className="mb-3">
                                                                        <h6 className="fw-bold">
                                                                            <i className="bi bi-cup-hot me-2 text-warning"></i>
                                                                            Snacks
                                                                        </h6>
                                                                        <p>{menu.snacks}</p>
                                                                    </div>
                                                                )}
                                                                <div className="mb-3">
                                                                    <h6 className="fw-bold">
                                                                        <i className="bi bi-moon me-2 text-warning"></i>
                                                                        Dinner
                                                                    </h6>
                                                                    <p>{menu.dinner}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-end">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => {
                                                                    setMenuFormData({
                                                                        date: new Date(menu.date).toISOString().split('T')[0],
                                                                        breakfast: menu.breakfast,
                                                                        lunch: menu.lunch,
                                                                        dinner: menu.dinner,
                                                                        snacks: menu.snacks || ''
                                                                    });
                                                                }}
                                                            >
                                                                <i className="bi bi-pencil me-1"></i> Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div>
                    {/* Feedback Statistics */}
                    <div className="row g-4 mb-4">
                        {feedbackStats && feedbackStats.avgRatingsByMeal.map(stat => (
                            <div className="col-md-3" key={stat._id}>
                                <div className={`card bg-${getRatingColor(stat.averageRating)} text-white h-100`}>
                                    <div className="card-body">
                                        <h5 className="card-title text-capitalize">{stat._id}</h5>
                                        <div className="d-flex align-items-center">
                                            <h2 className="display-4 me-2">{stat.averageRating.toFixed(1)}</h2>
                                            {renderStars(stat.averageRating)}
                                        </div>
                                        <p className="card-text">Based on {stat.count} reviews</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rating Distribution and Trends Charts */}
                    {feedbackStats && (
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0">Rating Distribution</h5>
                                    </div>
                                    <div className="card-body">
                                        <div style={{ height: '300px' }}>
                                            <Pie
                                                data={{
                                                    labels: feedbackStats.ratingDistribution.map(r => `${r._id} Stars`),
                                                    datasets: [
                                                        {
                                                            data: feedbackStats.ratingDistribution.map(r => r.count),
                                                            backgroundColor: [
                                                                '#dc3545', // 1 star - danger
                                                                '#fd7e14', // 2 stars - orange
                                                                '#ffc107', // 3 stars - warning
                                                                '#0dcaf0', // 4 stars - info
                                                                '#198754', // 5 stars - success
                                                            ],
                                                            borderWidth: 1,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom',
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => {
                                                                    const label = context.label || '';
                                                                    const value = context.raw || 0;
                                                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                    const percentage = Math.round((value / total) * 100);
                                                                    return `${label}: ${value} (${percentage}%)`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Progress bars for each rating */}
                                        <div className="mt-4">
                                            {feedbackStats.ratingDistribution.map(rating => {
                                                const percentage = (rating.count / feedback.length) * 100;
                                                return (
                                                    <div className="mb-2" key={rating._id}>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span>{rating._id} Stars</span>
                                                            <span>{rating.count} reviews ({percentage.toFixed(1)}%)</span>
                                                        </div>
                                                        <div className="progress" style={{ height: '10px' }}>
                                                            <div
                                                                className={`progress-bar bg-${getRatingColor(rating._id)}`}
                                                                role="progressbar"
                                                                style={{ width: `${percentage}%` }}
                                                                aria-valuenow={percentage}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0">Recent Trends (Last 7 Days)</h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Group trends by date and meal type for the chart */}
                                        {(() => {
                                            // Process data for the chart
                                            const trendsByMeal = {};
                                            const dates = [...new Set(feedbackStats.recentTrends.map(t => t._id.date))].sort();

                                            // Initialize meal types
                                            feedbackStats.recentTrends.forEach(trend => {
                                                if (!trendsByMeal[trend._id.mealType]) {
                                                    trendsByMeal[trend._id.mealType] = {
                                                        label: trend._id.mealType.charAt(0).toUpperCase() + trend._id.mealType.slice(1),
                                                        data: [],
                                                        borderColor: trend._id.mealType === 'breakfast' ? '#fd7e14' :
                                                                    trend._id.mealType === 'lunch' ? '#0d6efd' :
                                                                    trend._id.mealType === 'snacks' ? '#6f42c1' : '#198754',
                                                        backgroundColor: trend._id.mealType === 'breakfast' ? 'rgba(253, 126, 20, 0.2)' :
                                                                        trend._id.mealType === 'lunch' ? 'rgba(13, 110, 253, 0.2)' :
                                                                        trend._id.mealType === 'snacks' ? 'rgba(111, 66, 193, 0.2)' : 'rgba(25, 135, 84, 0.2)',
                                                    };
                                                }
                                            });

                                            // Fill in data for each date
                                            dates.forEach(date => {
                                                Object.keys(trendsByMeal).forEach(mealType => {
                                                    const trend = feedbackStats.recentTrends.find(t =>
                                                        t._id.date === date && t._id.mealType === mealType
                                                    );

                                                    trendsByMeal[mealType].data.push(
                                                        trend ? trend.averageRating : null
                                                    );
                                                });
                                            });

                                            return (
                                                <div style={{ height: '300px' }}>
                                                    <Line
                                                        data={{
                                                            labels: dates.map(d => new Date(d).toLocaleDateString()),
                                                            datasets: Object.values(trendsByMeal),
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            scales: {
                                                                y: {
                                                                    min: 1,
                                                                    max: 5,
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Average Rating'
                                                                    }
                                                                }
                                                            },
                                                            plugins: {
                                                                legend: {
                                                                    position: 'bottom',
                                                                },
                                                                tooltip: {
                                                                    callbacks: {
                                                                        label: (context) => {
                                                                            const label = context.dataset.label || '';
                                                                            const value = context.raw !== null ? context.raw.toFixed(1) : 'No data';
                                                                            return `${label}: ${value}`;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })()}

                                        {/* Table with detailed data */}
                                        <div className="table-responsive mt-4">
                                            <table className="table table-sm table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Meal Type</th>
                                                        <th>Avg. Rating</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {feedbackStats.recentTrends.map((trend, index) => (
                                                        <tr key={index}>
                                                            <td>{new Date(trend._id.date).toLocaleDateString()}</td>
                                                            <td className="text-capitalize">{trend._id.mealType}</td>
                                                            <td>
                                                                <span className={`badge bg-${getRatingColor(trend.averageRating)}`}>
                                                                    {trend.averageRating.toFixed(1)}
                                                                </span>
                                                                {' '}
                                                                {renderStars(trend.averageRating)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback List */}
                    <div className="card">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Student Feedback</h5>
                        </div>
                        <div className="card-body">
                            {feedbackLoading ? (
                                <div className="text-center my-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : feedback.length === 0 ? (
                                <div className="alert alert-info" role="alert">
                                    No feedback received yet.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Student</th>
                                                <th>Meal</th>
                                                <th>Rating</th>
                                                <th>Feedback</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feedback.map(item => (
                                                <tr key={item._id}>
                                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                                    <td>{item.studentName} ({item.studentId})</td>
                                                    <td className="text-capitalize">{item.mealType}</td>
                                                    <td>
                                                        <span className={`badge bg-${getRatingColor(item.rating)}`}>
                                                            {item.rating}
                                                        </span>
                                                        {' '}
                                                        {renderStars(item.rating)}
                                                    </td>
                                                    <td>{item.feedback || <em className="text-muted">No comments</em>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'count' && (
                <FoodCountManager />
            )}

            {activeTab === 'students' && (
                <StudentFoodManager />
            )}
        </div>
    );
};

export default Food;
