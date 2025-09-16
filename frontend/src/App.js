import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // <-- 1. IMPORT THE LIBRARY
import './App.css';

function App() {
  const [passageQuery, setPassageQuery] = useState('');
  const [scriptureText, setScriptureText] = useState('(The Bible text will appear here...)');
  const [contextText, setContextText] = useState('(The historical context and commentary will appear here...)');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!passageQuery) {
      alert("Please enter a passage.");
      return;
    }
    
    setIsLoading(true);
    setScriptureText('Loading scripture...');
    setContextText('Generating context with AI...');

    try {
      const scriptureUrl = `http://localhost:3000/api/scripture?q=${passageQuery}`;
      const contextUrl = `http://localhost:3000/api/context?q=${passageQuery}`;

      const [scriptureResponse, contextResponse] = await Promise.all([
        fetch(scriptureUrl),
        fetch(contextUrl)
      ]);

      const scriptureData = await scriptureResponse.json();
      const contextData = await contextResponse.json();

      setScriptureText(scriptureData.passageText || 'Could not find the requested passage.');
      setContextText(contextData.contextText || 'Could not generate context.');

    } catch (error) {
      console.error("Failed to fetch data:", error);
      setScriptureText('An error occurred while connecting to the server.');
      setContextText('An error occurred. Please check the server console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="panel scripture-panel">
        <h1>The Scribe's Companion</h1>
        
        <div className="input-group">
          <input 
            type="text" 
            value={passageQuery}
            onChange={(e) => setPassageQuery(e.target.value)}
            placeholder="Enter a passage (e.g., Romans 8:28)"
            disabled={isLoading}
          />
          <button onClick={fetchData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Passage'}
          </button>
        </div>
        
        <hr />

        <h2>Scripture</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{scriptureText}</p>
      </div>

      <div className="panel context-panel">
        <h2>Context</h2>
        {/* --- 2. USE THE MARKDOWN COMPONENT --- */}
        <ReactMarkdown>{contextText}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;