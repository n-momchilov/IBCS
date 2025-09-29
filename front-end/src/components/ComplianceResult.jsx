import React from 'react';

function ComplianceResult({ result, image, isDashboard }) {
    if (!result) return null;

    return (
        <section className="card p-4 result">
            <h2>Analysis Result</h2>

            <div className="image-container">
                {image && (
                    <div className="preview-box">
                        <h3>Uploaded Image</h3>
                        <img src={image} alt="Uploaded" className="preview-image" />
                    </div>
                )}
            </div>

            {isDashboard ? (
                result.results.map((entry) => (
                    <div key={entry.index} className="dashboard-entry">
                        <h3>Graph #{entry.index}</h3>
                        <img
                            src={entry.heatmap}
                            alt={`LIME Heatmap ${entry.index}`}
                            className="heatmap-image"
                        />
                        <p className={entry.compliant ? 'status pass' : 'status fail'}>
                            {entry.compliant
                                ? '✅ This chart is IBCS color compliant.'
                                : '❌ This chart does not meet IBCS color standards.'}
                        </p>

                        <ul>
                            {entry.explanation.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>

                        {!entry.compliant && (
                            <p className="ibcs-info-link">
                                For more information about the IBCS color rules, you can visit this link:{' '}
                                <a
                                    href="https://www.ibcs.com/standards/page/3/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ibcs-link"
                                >
                                    IBCS Standards
                                </a>
                            </p>
                        )}
                    </div>
                ))
            ) : (
                <>
                    <img
                        src={result.heatmap}
                        alt="LIME Heatmap"
                        className="heatmap-image"
                    />
                    <p className={result.compliant ? 'status pass' : 'status fail'}>
                        {result.compliant
                            ? '✅ This image is IBCS color compliant.'
                            : '❌ This image does not meet IBCS color standards.'}
                    </p>

                    <ul>
                        {result.explanation.map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>

                    {!result.compliant && (
                        <p className="ibcs-info-link">
                            For more information about the IBCS color rules, you can visit this link:{' '}
                            <a
                                href="https://www.ibcs.com/standards/page/3/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ibcs-link"
                            >
                                IBCS Standards
                            </a>
                        </p>
                    )}
                </>
            )}
        </section>
    );
}

export default ComplianceResult;
