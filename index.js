const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('pdf-parse');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Convert PDF to text endpoint
app.post('/api/convert', async (req, res) => {
    try {
        let pdfData;
        if (req.body.pdfUrl) {
            const response = await axios.get(req.body.pdfUrl, { responseType: 'arraybuffer' });
            pdfData = response.data;
        } else if (req.body.pdfData) {
            pdfData = Buffer.from(req.body.pdfData, 'base64');
        } else {
            return res.status(400).json({ error: 'Please provide a PDF URL or PDF data.' });
        }

        const dataBuffer = await pdf(pdfData);
        const text = dataBuffer.text.replace(/\s+/g, ' ').trim();

        res.json({ text });
    } catch (error) {
        console.error('Error converting PDF to text:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle unsupported HTTP methods
app.use((req, res, next) => {
    res.status(405).json({ error: 'Method not allowed' });
});

// Handle invalid routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
