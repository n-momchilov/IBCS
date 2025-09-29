import React from 'react';
import './HeroSection.css'; // Optional, or include in main CSS

function HeroSection() {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1 className="hero-heading">
                    We <span className="orange-text">add value</span> to <span className="blue-text">data</span>
                </h1>
                

                {/*  Jugo Button */}
                <a
                    href="https://jugo.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jugo-link-button"
                >
                    Visit Jugo Website
                </a>
            </div>
            <div className="hero-image">
                {/* Optional hero graphic */}
            </div>
        </section>
    );
}

export default HeroSection;
