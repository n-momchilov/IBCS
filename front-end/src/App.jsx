import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ImageUpload from './components/ImageUpload';
import ComplianceResult from './components/ComplianceResult';
import Footer from './components/Footer';
import './index.css';

function App() {
    const [result, setResult] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDashboard, setIsDashboard] = useState(false);

    const handlePredictionResult = (data, imageURL, dashboardFlag) => {
        setResult(data);
        setImagePreview(imageURL);
        setIsDashboard(dashboardFlag);
    };

    return (
        <div className="app-container">
            {/* ✅ Background layer behind all */}
            <div className="icon-background-layer">
                <img src="/icon1.png" alt="icon" className="floating-icon icon1" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon2" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon3" />
                <img src="/icon1.png" alt="icon" className="floating-icon icon4" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon5" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon6" />
                <img src="/icon1.png" alt="icon" className="floating-icon icon7" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon8" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon9" />
                <img src="/icon1.png" alt="icon" className="floating-icon icon10" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon11" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon12" />
                <img src="/icon1.png" alt="icon" className="floating-icon icon13" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon14" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon15" />
                <img src="/icon1.png" alt="icon" className="floating-icon icon16" />
                <img src="/icon2.png" alt="icon" className="floating-icon icon17" />
                <img src="/icon3.png" alt="icon" className="floating-icon icon18" />
                
            </div>

            <Navbar />
            <HeroSection />
            <ImageUpload onResult={handlePredictionResult} />
            <main className="main-content">
                {result && (
                    <ComplianceResult
                        result={result}
                        image={imagePreview}
                        isDashboard={isDashboard}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}


export default App;
