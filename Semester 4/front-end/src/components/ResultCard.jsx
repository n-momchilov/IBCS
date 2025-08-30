import React from 'react';

function ResultCard({ result }) {
    return (
        <div className="result-card">
            <h2>Prediction Result</h2>

            <p className={result.compliant ? 'pass' : 'fail'}>
                {result.compliant
                    ? '✅ Compliant with ICBS rules'
                    : '❌ Not compliant with IBCS rules'}
            </p>
        </div>
    );
}

export default ResultCard;
