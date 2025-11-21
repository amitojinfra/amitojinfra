import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function About() {
  return (
    <Layout title="About - AmitojInfra" description="Learn about AmitojInfra's mission, vision, and team">
      <div>
        <h1>About AmitojInfra</h1>
        
        <div className="card">
          <h2>Our Mission</h2>
          <p>
            At AmitojInfra, we are committed to providing world-class infrastructure 
            solutions that empower businesses to achieve their goals. We believe in 
            delivering reliable, scalable, and innovative technology solutions that 
            drive digital transformation and business growth.
          </p>
        </div>
        
        <div className="card">
          <h2>Our Vision</h2>
          <p>
            To be the leading provider of infrastructure and technology services, 
            recognized for our expertise, innovation, and commitment to client success. 
            We envision a future where businesses can focus on their core competencies 
            while we handle their infrastructure needs seamlessly.
          </p>
        </div>
        
        <div className="card">
          <h2>Our Values</h2>
          <ul>
            <li><strong>Excellence:</strong> We strive for the highest quality in everything we do</li>
            <li><strong>Innovation:</strong> We embrace new technologies and creative solutions</li>
            <li><strong>Reliability:</strong> Our clients can count on us for consistent, dependable service</li>
            <li><strong>Transparency:</strong> We believe in open, honest communication</li>
            <li><strong>Partnership:</strong> We work closely with our clients as trusted advisors</li>
          </ul>
        </div>
        
        <div className="card">
          <h2>Why Choose AmitojInfra?</h2>
          <div className="grid">
            <div>
              <h3>Experienced Team</h3>
              <p>Our team consists of seasoned professionals with extensive experience in infrastructure and technology solutions.</p>
            </div>
            <div>
              <h3>Proven Track Record</h3>
              <p>We have successfully delivered projects for clients across various industries and scales.</p>
            </div>
            <div>
              <h3>24/7 Support</h3>
              <p>Our dedicated support team is available around the clock to ensure your systems run smoothly.</p>
            </div>
            <div>
              <h3>Scalable Solutions</h3>
              <p>Our solutions are designed to grow with your business, adapting to changing needs and requirements.</p>
            </div>
          </div>
        </div>
        
        <div className="card text-center">
          <h2>Ready to Learn More?</h2>
          <p>Discover how AmitojInfra can help transform your business infrastructure.</p>
          <Link href="/contact" className="btn">Contact Us Today</Link>
        </div>
      </div>
    </Layout>
  );
}