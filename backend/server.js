// backend/server.js

const express = require('express');
const multer = require('multer');
require('dotenv').config();
const axios = require('axios');

// --- INITIALIZATION ---
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Get credentials from .env file
const azureKey = process.env.AZURE_VISION_KEY;
const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
const hfKey = process.env.HUGGINGFACE_API_KEY;

// Helper function for waiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- API ENDPOINT ---
app.post('/process-report', upload.single('reportFile'), async (req, res) => {
    console.log("Request received to process a report.");
    if (!req.file) {
        return res.status(400).json({ error: 'No file was uploaded.' });
    }

    try {
        // --- STEP 1: OCR with AZURE ---
        console.log("Performing OCR with Azure REST API...");
        const analyzeUrl = `${azureEndpoint}/vision/v3.2/read/analyze`;
        const initialResponse = await axios.post(analyzeUrl, req.file.buffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': azureKey
            }
        });
        const operationUrl = initialResponse.headers['operation-location'];
        
        let result;
        while (true) {
            await sleep(1000);
            const pollResponse = await axios.get(operationUrl, {
                headers: { 'Ocp-Apim-Subscription-Key': azureKey }
            });
            result = pollResponse.data;
            if (result.status === 'succeeded' || result.status === 'failed') break;
        }

        if (result.status === "failed") throw new Error("Azure OCR process failed.");
        
        let extractedText = "";
        if (result.analyzeResult && result.analyzeResult.readResults) {
            for (const page of result.analyzeResult.readResults) {
                for (const line of page.lines) {
                    extractedText += line.text + " ";
                }
            }
        }
        if (!extractedText) return res.status(400).json({ error: 'Could not extract any text.' });
        console.log("Azure OCR successful.");


        // --- ✨ NEW: Sanitize and truncate the text for Hugging Face ---
        let textToSummarize = extractedText.trim(); // Remove leading/trailing whitespace
        if (textToSummarize.length === 0) {
            throw new Error("Extracted text was only whitespace.");
        }
        
        // Most summarization models have a limit around 1024 tokens (~3000-4000 chars)
        // We'll set a safe limit of 3000 characters to prevent the "index out of range" error.
        const MAX_TEXT_LENGTH = 3000; 
        if (textToSummarize.length > MAX_TEXT_LENGTH) {
            console.log(`Truncating text from ${textToSummarize.length} to ${MAX_TEXT_LENGTH} chars.`);
            textToSummarize = textToSummarize.substring(0, MAX_TEXT_LENGTH);
        }
        // --- END OF NEW LOGIC ---


        // --- STEP 2: SUMMARIZATION with Hugging Face ---
        console.log("Generating summary with Hugging Face...");
        
        const hfUrl = 'https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn';
        
        const response = await axios.post(hfUrl, 
            { inputs: textToSummarize }, // <-- Use the new truncated variable
            { headers: { 'Authorization': `Bearer ${hfKey}` } }
        );

        const summary = response.data[0].summary_text;
        console.log("Summary generated successfully.");

        // --- STEP 3: SEND THE RESPONSE ---
        res.status(200).json({ summary });

    } catch (error) {
        console.error('An error occurred:', error.message);
        if (error.response) console.error('Error details:', error.response.data);
        res.status(500).json({ error: 'Failed to process the report due to an internal error.' });
    }
});

// --- Start the server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running and listening on port ${PORT}`);
});