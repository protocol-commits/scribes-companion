// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Import the Google AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

app.use(cors());

// --- Initialize the Google AI Model ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// --- Endpoint for fetching scripture ---
// This endpoint remains the same as before
app.get('/api/scripture', async (req, res) => {
  const passage = req.query.q;
  if (!passage) {
    return res.status(400).json({ error: 'A passage query (q) is required.' });
  }

  const ESV_API_URL = 'https://api.esv.org/v3/passage/text/';
  const apiKey = process.env.ESV_API_KEY;

  try {
    const response = await axios.get(ESV_API_URL, {
      params: {
        'q': passage, 'include-headings': false, 'include-footnotes': false,
        'include-verse-numbers': true, 'include-passage-references': false
      },
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    res.json({ passageText: response.data.passages[0] });
  } catch (error) {
    console.error('Error fetching from ESV API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch scripture.' });
  }
});

// --- NEW Endpoint for fetching AI context ---
app.get('/api/context', async (req, res) => {
    const passage = req.query.q;
    if (!passage) {
        return res.status(400).json({ error: 'A passage query (q) is required.' });
    }

    // This is the detailed prompt that ensures a Reformed Theological perspective
    const prompt = `
        Act as a Reformed theologian and Bible scholar providing commentary for a study Bible.
        Analyze the following biblical passage: ${passage}.
        Provide a clear, concise analysis covering these key areas:
        1.  **Author and Date:** Briefly state who wrote the book and when.
        2.  **Historical Context:** Describe the circumstances surrounding the original audience. What was happening politically, culturally, and within the early church or Israel?
        3.  **Theological Significance:** Explain the main theological points of this specific passage, interpreting it through a Reformed lens. Emphasize themes like God's sovereignty, covenant theology, the glory of God (Soli Deo Gloria), and how this passage points to Christ.
        Structure your response using markdown for clear headings.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        res.json({ contextText: text });
    } catch (error) {
        console.error("Error fetching from Google AI:", error);
        res.status(500).json({ error: 'Failed to generate context.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});