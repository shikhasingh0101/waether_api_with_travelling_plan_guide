import { useState } from 'react';
import './App.css';

const API_BASE = 'http://127.0.0.1:5000';

const TravelGuideDisplay = ({ guideText, itineraryData, travelSummaryData }) => {
  if (!guideText) return null;

  const renderItinerary = () => {
    if (!itineraryData?.itinerary) return null;
    return Object.entries(itineraryData.itinerary).map(([day, activities]) => (
      <div key={day} style={{ marginBottom: "1rem" }}>
        <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
        <ul>
          {activities.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="result-box" style={{ marginTop: '1rem' }}>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: "1.1rem", lineHeight: "1.5", marginBottom: "1rem" }}>
        {guideText}
      </pre>
      <hr />
      <h3>Day-wise Itinerary</h3>
      {renderItinerary()}
      <hr />
      <h3>Travel Summary</h3>
      <p>{travelSummaryData?.summary || "No travel summary available."}</p>
    </div>
  );
};

const App = () => {
  const [userMessage, setUserMessage] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [errorExtract, setErrorExtract] = useState(null);

  const [travelMessage, setTravelMessage] = useState('');
  const [packingResponse, setPackingResponse] = useState(null);
  const [errorPacking, setErrorPacking] = useState(null);
  const [loadingPacking, setLoadingPacking] = useState(false);

  const [travelGuideResponse, setTravelGuideResponse] = useState(null);
  const [loadingTravelGuide, setLoadingTravelGuide] = useState(false);
  const [errorTravelGuide, setErrorTravelGuide] = useState(null);

  const handleExtract = async () => {
    if (!userMessage) {
      setErrorExtract('Please enter a message');
      return;
    }
    setLoadingExtract(true);
    setErrorExtract(null);
    setExtracted(null);
    try {
      const res = await fetch(`${API_BASE}/extract_location_date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (data.error) setErrorExtract(data.error);
      else setExtracted(data);
    } catch (e) {
      setErrorExtract('Failed to extract location and date');
    }
    setLoadingExtract(false);
  };

  const [loadingAccommodation, setLoadingAccommodation] = useState(false);
  const [errorAccommodation, setErrorAccommodation] = useState(null);
  const [accommodationResponse, setAccommodationResponse] = useState(null);

  const handleTravelAccommodation = async () => {
    if (!travelMessage) return;
    setLoadingAccommodation(true);
    setErrorAccommodation(null);
    setAccommodationResponse(null);
    try {
      const res = await fetch(`${API_BASE}/travel_guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: travelMessage }),
      });
      const data = await res.json();
      if (data.error) setErrorAccommodation(data.error);
      else setAccommodationResponse(data);
    } catch (e) {
      setErrorAccommodation('Failed to get accommodation guide');
    }
    setLoadingAccommodation(false);
  };

  const handleFullTravelGuide = async () => {
    if (!travelMessage) return;
    setLoadingTravelGuide(true);
    setErrorTravelGuide(null);
    setTravelGuideResponse(null);
    try {
      const res = await fetch(`${API_BASE}/full_travel_guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: travelMessage }),
      });
      const data = await res.json();
      if (data.error) setErrorTravelGuide(data.error);
      else setTravelGuideResponse(data);
    } catch (e) {
      setErrorTravelGuide('Failed to get full travel guide');
    }
    setLoadingTravelGuide(false);
  };

  return (
    <div className="container">
      <h1>🌦️ Weather Summarizer & AI Travel Assistant</h1>

      <section className="section">
        <h2>📍 Extract Location & Date</h2>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="e.g., What's the weather in Paris on 2023-06-01?"
          className="textarea"
        />
        <button className="button" onClick={handleExtract} disabled={loadingExtract}>
          Extract & Summarize
        </button>
        {loadingExtract && <p className="loading">Loading...</p>}
        {errorExtract && <p className="error">{errorExtract}</p>}
        {extracted && (
          <div className="result-box">
            {extracted.location && <p><strong>Location:</strong> {extracted.location}</p>}
            {extracted.date && <p><strong>Date:</strong> {extracted.date}</p>}
            {extracted.weather_summary && (
              <p><strong>Summary:</strong> {extracted.weather_summary}</p>
            )}
          </div>
        )}
      </section>

      <section className="section premium">
  <h2>
    🏨 Travel Accommodation Guide <span className="premium-tag">Premium</span>
  </h2>
  <textarea
    value={travelMessage}
    onChange={(e) => setTravelMessage(e.target.value)}
    placeholder="e.g., I am visiting Paris next month. Can you suggest accommodation?"
    className="textarea"
  />
  <button
    className="button premium-btn"
    onClick={handleTravelAccommodation}
    disabled={!travelMessage || loadingAccommodation}
  >
    Get Accommodation Guide
  </button>

  {loadingAccommodation && <p className="loading">Loading accommodation guide...</p>}
  {errorAccommodation && <p className="error">{errorAccommodation}</p>}

  {accommodationResponse && (
    <div className="result-box">
      <p>
        <strong>Location:</strong> {accommodationResponse.city}
      </p>
      <p>
        <strong>Date:</strong> {accommodationResponse.date}
      </p>
      <p>
        <strong>Accommodation Suggestions:</strong>
      </p>
      <div style={{ whiteSpace: "pre-line", marginTop: "0.5rem" }}>
        {accommodationResponse.accommodation?.summary || "No suggestions available."}
      </div>
    </div>
  )}
</section>

      <section className="section premium" style={{ marginTop: '2rem' }}>
        <h2>🗺️ Full Travel Guide <span className="premium-tag">Premium</span></h2>
        <textarea
          value={travelMessage}
          onChange={(e) => setTravelMessage(e.target.value)}
          placeholder="Enter your travel query here..."
          className="textarea"
        />
        <button
          className="button premium-btn"
          onClick={handleFullTravelGuide}
          disabled={!travelMessage || loadingTravelGuide}
        >
          Get Full Travel Guide
        </button>
        {loadingTravelGuide && <p className="loading">Loading full travel guide...</p>}
        {errorTravelGuide && <p className="error">{errorTravelGuide}</p>}
        {travelGuideResponse && (
          <TravelGuideDisplay
            guideText={travelGuideResponse.formatted_response}
            itineraryData={travelGuideResponse.itinerary}
            travelSummaryData={travelGuideResponse.travel_summary}
          />
        )}
      </section>
    </div>
  );
};

export default App;
