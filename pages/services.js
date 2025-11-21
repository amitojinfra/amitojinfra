import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function Services() {
  return (
    <Layout title="Services - AmitojInfra" description="Explore AmitojInfra's comprehensive infrastructure and technology services">
      <div>
        <h1>Our Services</h1>
        <p className="text-center mb-4">
          Comprehensive infrastructure and technology solutions tailored to your business needs.
        </p>
        
        <div className="grid">
          <div className="card">
            <h2>Cloud Infrastructure</h2>
            <p>
              Design, migrate, and manage your cloud infrastructure across AWS, Azure, 
              and Google Cloud Platform. We ensure scalability, security, and cost optimization.
            </p>
            <ul>
              <li>Cloud architecture design</li>
              <li>Migration planning and execution</li>
              <li>Multi-cloud management</li>
              <li>Cost optimization</li>
              <li>Security implementation</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>Network Solutions</h2>
            <p>
              Robust networking solutions that ensure reliable connectivity, 
              security, and performance for your organization.
            </p>
            <ul>
              <li>Network design and implementation</li>
              <li>SD-WAN solutions</li>
              <li>VPN setup and management</li>
              <li>Network security</li>
              <li>Performance monitoring</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>DevOps & Automation</h2>
            <p>
              Streamline your development and deployment processes with modern 
              DevOps practices and automation tools.
            </p>
            <ul>
              <li>CI/CD pipeline setup</li>
              <li>Infrastructure as Code</li>
              <li>Container orchestration</li>
              <li>Monitoring and logging</li>
              <li>Process automation</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>Security Services</h2>
            <p>
              Comprehensive security solutions to protect your infrastructure, 
              data, and applications from modern threats.
            </p>
            <ul>
              <li>Security assessments</li>
              <li>Compliance management</li>
              <li>Identity and access management</li>
              <li>Threat monitoring</li>
              <li>Incident response</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>Data Management</h2>
            <p>
              Efficient data storage, backup, and recovery solutions to ensure 
              your critical data is always available and secure.
            </p>
            <ul>
              <li>Database design and optimization</li>
              <li>Backup and disaster recovery</li>
              <li>Data migration</li>
              <li>Analytics and reporting</li>
              <li>Data governance</li>
            </ul>
          </div>
          
          <div className="card">
            <h2>24/7 Support & Monitoring</h2>
            <p>
              Round-the-clock monitoring and support to ensure your systems 
              run smoothly and efficiently at all times.
            </p>
            <ul>
              <li>Proactive monitoring</li>
              <li>24/7 technical support</li>
              <li>Performance optimization</li>
              <li>Regular maintenance</li>
              <li>Issue resolution</li>
            </ul>
          </div>
        </div>
        
        <div className="card">
          <h2>Firebase & Firestore</h2>
          <p>
            Modern backend-as-a-service solutions with real-time databases, 
            authentication, and cloud functions for rapid application development.
          </p>
          <ul>
            <li>Real-time database management</li>
            <li>User authentication systems</li>
            <li>Cloud function deployment</li>
            <li>File storage solutions</li>
            <li>Analytics and monitoring</li>
          </ul>
          <div style={{ marginTop: '15px' }}>
            <Link href="/firestore-demo" className="btn-small">
              Try Firestore Demo
            </Link>
            <Link href="/firestore-realtime" className="btn-small" style={{ marginLeft: '10px' }}>
              Real-time Demo
            </Link>
          </div>
        </div>
        
        <div className="card text-center mt-4">
          <h2>Custom Solutions</h2>
          <p>
            Every business is unique. We work with you to develop custom infrastructure 
            solutions that align with your specific requirements and goals.
          </p>
          <Link href="/contact" className="btn">
            Discuss Your Needs
          </Link>
        </div>
      </div>
    </Layout>
  );
}