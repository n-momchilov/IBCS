import React, { useState } from 'react';



function UploadForm({ onPredict }) {
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!image) return;

        // Simulate a fake prediction
        const fakeResponse = {
            compliant: Math.random() > 0.5,
            color: 'Blue',
        };

        onPredict(fakeResponse);
    };

    return (
        <form onSubmit={handleSubmit} className="form-card">
            <label>Upload an image:</label>
            <input type="file" accept="image/*" onChange={handleChange} />
            <button type="submit">Check Compliance</button>
        </form>
    );
}

export default UploadForm;
