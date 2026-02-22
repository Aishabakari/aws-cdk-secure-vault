import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Get API Gateway URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const handleQueryDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`${API_URL}/query`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏦 Secure Investor Vault</h1>
        <p>Built with AWS CDK, Lambda, RDS & React</p>
      </header>

      <main className="App-main">
        <section className="query-section">
          <h2>Database Query Test</h2>
          <p>Click below to execute a test query on the secure Postgres database.</p>

          <button
            onClick={handleQueryDatabase}
            disabled={loading}
            className="query-button"
          >
            {loading ? 'Querying...' : 'Query Database'}
          </button>

          {error && (
            <div className="error">
              <h3>❌ Error:</h3>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}

          {result && (
            <div className="success">
              <h3>✅ Query Successful:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="info-section">
          <h2>Architecture Overview</h2>
          <ul>
            <li>
              <strong>VPC:</strong> Custom Virtual Private Cloud with public & private
              subnets
            </li>
            <li>
              <strong>Database:</strong> RDS Postgres in isolated private subnet
            </li>
            <li>
              <strong>Compute:</strong> Lambda functions with VPC integration
            </li>
            <li>
              <strong>Secrets:</strong> AWS Secrets Manager for secure credential
              storage
            </li>
            <li>
              <strong>API:</strong> API Gateway for REST endpoints
            </li>
            <li>
              <strong>Frontend:</strong> React SPA served via S3 + CloudFront CDN
            </li>
          </ul>
        </section>
      </main>

      <footer className="App-footer">
        <p>
          Demonstrating enterprise-grade AWS infrastructure patterns for secure
          data handling.
        </p>
      </footer>
    </div>
  );
}

export default App;
