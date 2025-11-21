import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout title="Home - AmitojInfra" description="Welcome to AmitojInfra - Your trusted infrastructure partner">
      <div className="text-center">
        <h1>Welcome to AmitojInfra</h1>
        <p className="mt-3 mb-4">
          Your trusted partner for infrastructure solutions and technology services.
        </p>
        
        <div className="grid">
          <div className="card">
            <h2>Infrastructure Solutions</h2>
            <p>
              Comprehensive infrastructure planning, implementation, and management 
              services tailored to your business needs.
            </p>
            <Link href="/services" className="btn">
              Learn More
            </Link>
          </div>
          
          <div className="card">
            <h2>Technology Consulting</h2>
            <p>
              Expert guidance on technology strategy, digital transformation, 
              and modernization initiatives.
            </p>
            <Link href="/services" className="btn">
              Explore Services
            </Link>
          </div>
          
          <div className="card">
            <h2>About Our Company</h2>
            <p>
              Learn about our mission, vision, and the experienced team behind 
              AmitojInfra's success stories.
            </p>
            <Link href="/about" className="btn">
              About Us
            </Link>
          </div>
        </div>
        
        <div className="mt-4">
          <h2>Ready to Get Started?</h2>
          <p className="mb-3">
            Contact us today to discuss your infrastructure needs and discover 
            how we can help your business grow.
          </p>
          <Link href="/contact" className="btn">
            Get In Touch
          </Link>
        </div>
      </div>
    </Layout>
  );
}