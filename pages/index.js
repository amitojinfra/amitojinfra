import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout title="Home - AmitojInfra" description="Welcome to AmitojInfra - Your trusted infrastructure partner">
      <div className="text-center">
        <h1>Welcome to AmitojInfra</h1>
        <p className="mt-3 mb-4">
          Your trusted partner for employee management and attendance tracking solutions.
        </p>
        
        <div className="grid">
          <div className="card">
            <h2>Employee Management</h2>
            <p>
              Comprehensive employee information management system with secure 
              authentication and role-based access control.
            </p>
            <Link href="/employees" className="btn">
              Manage Employees
            </Link>
          </div>
          
          <div className="card">
            <h2>Attendance Tracking</h2>
            <p>
              Advanced attendance management with real-time tracking, reporting, 
              and analytics for better workforce insights.
            </p>
            <Link href="/attendance" className="btn">
              Track Attendance
            </Link>
          </div>
          
          <div className="card">
            <h2>Dashboard & Analytics</h2>
            <p>
              Comprehensive dashboard with key metrics, trends, and actionable 
              insights for effective workforce management.
            </p>
            <Link href="/dashboard" className="btn">
              View Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-4">
          <h2>Ready to Get Started?</h2>
          <p className="mb-3">
            Sign in to access your employee management system and start tracking 
            attendance with powerful analytics and reporting features.
          </p>
          <Link href="/auth" className="btn">
            Sign In Now
          </Link>
        </div>
      </div>
    </Layout>
  );
}