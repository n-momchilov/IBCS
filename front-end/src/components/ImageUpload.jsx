import React, { useState } from 'react';

function ImageUpload({ onResult }) {
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDashboard, setIsDashboard] = useState(false);
    const [hideFeatures, setHideFeatures] = useState(false);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            setError('Please select an image before submitting.');
            return;
        }

        setLoading(true);
        setHideFeatures(true); // hide features after clicking

        setError(null);

        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await fetch(
                isDashboard
                    ? 'http://localhost:5000/dashboard_predict'
                    : 'http://localhost:5000/predict',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Something went wrong while analyzing the image.'
                );
            }

            const data = await response.json();
            const imageURL = URL.createObjectURL(imageFile);
            onResult(data, imageURL, isDashboard);
        } catch (err) {
            console.error('Prediction error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (

        <div className="upload-section">
            <div className="card-background-wrapper">
                <section className="card p-4">
                    <h2>Upload Image</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="custom-file-upload mb-3">
                            <input
                                id="fileUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="fileUpload">
                                {imageFile ? imageFile.name : 'Choose a File'}
                            </label>
                        </div>
                        <br />
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isDashboard}
                                onChange={(e) => setIsDashboard(e.target.checked)}
                                id="dashboardCheck"
                            />
                            <label className="form-check-label" htmlFor="dashboardCheck">
                                This is a dashboard image
                            </label>
                        </div>
                        <br />
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            Analyze Color Compliance
                        </button>
                        <br />
                        <br />
                    </form>

                    {loading && (
                        <div className="progress mt-3">
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: '100%' }}
                                aria-valuenow="100"
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            ❌ {error}
                        </div>
                    )}
                </section>

                <img
                    src="/Char_backg.png"
                    alt="Background decoration"
                    className="upload-card-bg-image"
                />
            </div>
            {!hideFeatures && (
                <div className="feature-banners">
                    <div className="feature-box">
                        <img src="/icon1.png" alt="Fast Color Validation" className="feature-icon-img" />
                        <h4>Fast Color Validation</h4>
                        <p>Upload an image and get instant feedback on color rule violations.</p>
                    </div>
                    <div className="feature-box">
                        <img src="/icon2.png" alt="Fast Color Validation" className="feature-icon-img" />
                        <h4>Dashboard Focus</h4>
                        <p>Specialized for BI dashboards with IBCS B Rule support.</p>
                    </div>
                    <div className="feature-box">
                        <img src="/icon3.png" alt="Fast Color Validation" className="feature-icon-img" />
                        <h4>AI-Driven</h4>
                        <p>Our model uses deep learning to ensure accuracy.</p>
                    </div>
                </div>
            )}</div>




    );
}

export default ImageUpload;
