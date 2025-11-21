import Layout from '../components/layout/Layout';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Since this is a static site, we'll just show an alert
    // In a real application, you would send this data to a server
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      company: '',
      message: ''
    });
  };

  return (
    <Layout title="Contact - AmitojInfra" description="Get in touch with AmitojInfra for your infrastructure needs">
      <div>
        <h1>Contact Us</h1>
        <p className="text-center mb-4">
          Ready to transform your infrastructure? Get in touch with our team of experts.
        </p>
        
        <div className="grid">
          <div className="card">
            <h2>Get In Touch</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="company" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <button type="submit" className="btn">
                Send Message
              </button>
            </form>
          </div>
          
          <div>
            <div className="card">
              <h2>Contact Information</h2>
              <div className="mb-3">
                <h3>Email</h3>
                <p>contact@amitojinfra.com</p>
              </div>
              
              <div className="mb-3">
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
              
              <div className="mb-3">
                <h3>Office Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
            
            <div className="card">
              <h2>Support</h2>
              <p>
                For existing clients requiring technical support, 
                our 24/7 support team is available to assist you.
              </p>
              <div className="mb-2">
                <strong>Support Email:</strong> support@amitojinfra.com
              </div>
              <div className="mb-2">
                <strong>Emergency Line:</strong> +1 (555) 911-HELP
              </div>
            </div>
          </div>
        </div>
        
        <div className="card text-center mt-4">
          <h2>Why Work With Us?</h2>
          <p>
            We provide personalized solutions, expert guidance, and ongoing support 
            to ensure your infrastructure needs are met efficiently and effectively.
          </p>
        </div>
      </div>
    </Layout>
  );
}