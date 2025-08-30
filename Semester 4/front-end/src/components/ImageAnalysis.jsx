const ImageAnalysis = ({ image }) => {
    if (!image) return null

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3">Image Analysis</h2>
            <p className="text-gray-600">Filename: {image.name}</p>
            <div className="mt-3 text-sm text-gray-500 italic">
                {/* Placeholder for real analysis */}
                🧪 Image analysis results will appear here.
            </div>
        </div>
    )
}

export default ImageAnalysis
