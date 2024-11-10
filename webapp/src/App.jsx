import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GroupView from './GroupView'; // Ensure this is the correct import path

function LandingPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to Spli.tech</h1>
        <p style={styles.subtitle}>Effortlessly manage and balance group expenses with friends.</p>
        <Link to="/example-group" style={styles.button}>
          Get Started
        </Link>
      </header>
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose Spli.tech?</h2>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <h3>Smart Splitting</h3>
            <p>Automatically calculates the simplest way to settle up.</p>
          </div>
          <div style={styles.featureItem}>
            <h3>Real-Time Tracking</h3>
            <p>Track who owes what and keep tabs on every transaction.</p>
          </div>
          <div style={styles.featureItem}>
            <h3>Quick Payments</h3>
            <p>Make payments easily and settle debts with one click.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<LandingPage />} />
        {/* Route for group view */}
        <Route path="/:groupName" element={<GroupView />} />
      </Routes>
    </Router>
  );
}

export default App;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    padding: '2rem',
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'center',
    padding: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0.5rem 0',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  button: {
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
  },
  features: {
    textAlign: 'center',
    maxWidth: '800px',
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  featureList: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  featureItem: {
    width: '250px',
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
};
