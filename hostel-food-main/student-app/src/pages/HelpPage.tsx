import React, { useState } from 'react';
import './HelpPage.css';

const HelpPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I pause my food service?",
      answer: "Go to the 'Pause' tab in the bottom navigation. You can choose from preset options like 'Tomorrow' or 'Weekend', or set custom dates. Remember to select which meals you want on your last day and return day."
    },
    {
      question: "Can I modify my pause after setting it?",
      answer: "Yes, you can modify your pause settings as long as the pause date hasn't started yet. Once your pause date arrives, you cannot make changes to that specific pause period."
    },
    {
      question: "What meals can I select on my last/return day?",
      answer: "On your last day before leaving, and your first day after returning, you can choose which specific meals (breakfast, lunch, snacks, dinner) you want. This helps ensure you get food when you need it most."
    },
    {
      question: "How do I check my meal schedule?",
      answer: "Use the 'Schedule' tab to view your upcoming meal plan. You can scroll through dates to see which meals are available each day based on your pause settings."
    },
    {
      question: "What if I need to return earlier than planned?",
      answer: "You can update your pause settings to change your return date, as long as you do this before your original return date. Go to the 'Pause' tab and modify your schedule."
    },
    {
      question: "How do I know if my meals are confirmed?",
      answer: "Your home screen shows today's available meals with colored indicators. Green means available, red means not available. You'll also see your current pause status there."
    },
    {
      question: "Can I pause indefinitely?",
      answer: "Yes, when setting up a pause, you can choose not to set a return date. This creates an indefinite pause that continues until you manually update it."
    },
    {
      question: "Who can I contact for help?",
      answer: "You can contact the hostel warden or administration office during working hours. For urgent issues, there's usually a 24-hour contact number available at the hostel reception."
    }
  ];

  const guides = [
    {
      icon: "🍽️",
      title: "Understanding Meal Times",
      description: "Learn about hostel meal schedules and timing",
      content: [
        "Breakfast: 7:00 AM - 9:00 AM",
        "Lunch: 12:00 PM - 2:00 PM", 
        "Snacks: 4:00 PM - 6:00 PM",
        "Dinner: 7:00 PM - 9:00 PM"
      ]
    },
    {
      icon: "📅",
      title: "Planning Your Pause",
      description: "Best practices for pausing food service",
      content: [
        "Plan at least 24 hours in advance",
        "Consider weekend vs weekday timing",
        "Think about your travel schedule",
        "Select appropriate last/return day meals"
      ]
    },
    {
      icon: "🎯",
      title: "Using Presets",
      description: "Quick setup options for common scenarios",
      content: [
        "Tomorrow: Quick one-day pause",
        "Weekend: Friday evening to Monday morning",
        "Custom: Set your own specific dates",
        "All presets can be customized after selection"
      ]
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Get help with using the hostel food app</p>
      </div>

      {/* Quick Contact */}
      <div className="contact-section">
        <h2>Need Immediate Help?</h2>
        <div className="contact-options">
          <button className="contact-btn emergency">
            <span className="contact-icon">📞</span>
            <div>
              <div className="contact-title">Emergency Contact</div>
              <div className="contact-subtitle">24/7 Hostel Reception</div>
            </div>
          </button>
          
          <button className="contact-btn warden">
            <span className="contact-icon">👨‍💼</span>
            <div>
              <div className="contact-title">Hostel Warden</div>
              <div className="contact-subtitle">Working hours: 9 AM - 6 PM</div>
            </div>
          </button>
          
          <button className="contact-btn email">
            <span className="contact-icon">📧</span>
            <div>
              <div className="contact-title">Email Support</div>
              <div className="contact-subtitle">hostel.food@college.edu</div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Guides */}
      <div className="guides-section">
        <h2>Quick Guides</h2>
        <div className="guides-grid">
          {guides.map((guide, index) => (
            <div key={index} className="guide-card">
              <div className="guide-icon">{guide.icon}</div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <ul>
                {guide.content.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${expandedFaq === index ? 'expanded' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <span className="faq-toggle">
                  {expandedFaq === index ? '−' : '+'}
                </span>
              </button>
              {expandedFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
          

      {/* Feedback */}
      <div className="feedback-section">
        <div className="feedback-card">
          <h2>Help Us Improve</h2>
          <p>Have suggestions or found a bug? We'd love to hear from you!</p>
          <button 
            className="feedback-btn"
            onClick={() => window.open('https://forms.gle/N2LF3MbxeSugDGJa9', '_blank')}
          >
            📝 Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
