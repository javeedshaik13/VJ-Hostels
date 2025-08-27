import React from 'react';
import './ContactSupportPage.css';

interface Contact {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  photo?: string;
}

const ContactSupportPage: React.FC = () => {
  const contacts: Contact[] = [
    {
      id: 1,
      name: "D Ravichandran",
      role: "Administrative Officer",
      email: "administrativeofficer@vnrvjiet.in ",
      phone: "+91-9947111965",
      department: "Administration",
      photo: "👤"
    },
    {
      id: 2,
      name: "Krishna Prasad",
      role: "Application Support",
      email: "head.iie@vnrvjiet.in",
      phone: "+91-7702969440",
      department: "Software Support",
      photo: "👤"
    },
    {
      id: 3,
      name: "Rohan Gutta",
      role: "Food Vendor",
      email: "",
      phone: "+91 91770 09595",
      department: "Feast Bell",
      photo: "👤"
    }
  ];

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📞 Contact Support</h1>
      </div>

      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-header">
              <div className="contact-photo">
                {contact.photo}
              </div>
              <div className="contact-basic">
                <h3 className="contact-name">{contact.name}</h3>
                <p className="contact-role">{contact.role}</p>
                <span className="contact-department">{contact.department}</span>
              </div>
            </div>
            
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-info">
                  <span className="contact-label">Email</span>
                  <button 
                    className="contact-link"
                    onClick={() => handleEmailClick(contact.email)}
                  >
                    {contact.email}
                  </button>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-info">
                  <span className="contact-label">Phone</span>
                  <button 
                    className="contact-link"
                    onClick={() => handlePhoneClick(contact.phone)}
                  >
                    {contact.phone}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="help-section">
        <div className="help-card">
          <h3>📋 Quick Help</h3>
          <ul className="help-list">
            <li><strong>Food Count Issues:</strong> Contact Rajeev (Food Vendor)</li>
            <li><strong>App/Technical Issues:</strong> Contact Krishna (Application Support)</li>
            <li><strong>Administrative Matters:</strong> Contact Ravi (Administrator)</li>
          </ul>
        </div>
        
        <div className="help-card">
          <h3>⏰ Support Hours</h3>
          <div className="support-hours">
            <div className="hours-item">
              <span>Monday - Friday:</span>
              <span>9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-item">
              <span>Saturday:</span>
              <span>10:00 AM - 4:00 PM</span>
            </div>
            <div className="hours-item">
              <span>Sunday:</span>
              <span>Emergency Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
