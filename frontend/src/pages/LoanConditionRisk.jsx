import React, { useState } from 'react';
import { apiRequest } from '../api';

export default function LoanConditionRisk() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const assess = async () => {
    setError('');
    try {
      const data = await apiRequest('/loan-condition-risk/assess', {
        method: 'POST',
        body: JSON.stringify({
          object: { id: 'OBJ-884', ageYears: 140, targetHumidity: 48, targetTempC: 19 },
          travel: { expectedHumidity: 62, expectedTempC: 24, legs: 3 },
          conditionReports: [{ status: 'open' }],
        }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Assessment failed');
    }
  };

  return (
    <div className="page">
      <h1>Loan Condition Risk</h1>
      <p>Assess outgoing-loan object risk from environment deltas, travel complexity, age, and open condition reports.</p>
      <button onClick={assess}>Assess loan risk</button>
      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {result && <pre style={{ marginTop: 20 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
