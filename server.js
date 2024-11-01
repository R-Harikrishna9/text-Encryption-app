const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/encryptionDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Schema and Model
const encryptedDataSchema = new mongoose.Schema({
    text: String,
    key: String,
    encryptedText: String,
});

const EncryptedData = mongoose.model('EncryptedData', encryptedDataSchema);

// Endpoint to encrypt text
app.post('/encrypt', async (req, res) => {
    const { text, key } = req.body;

    if (!text || !key) {
        return res.status(400).json({ error: 'Text and key are required' });
    }

    const encryptedText = CryptoJS.AES.encrypt(text, key).toString();

    // Save to the database
    try {
        const newEntry = new EncryptedData({ text, key, encryptedText });
        await newEntry.save();
        res.json({ encryptedText });
    } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).json({ error: 'Error saving encrypted text to database' });
    }
});

// Endpoint to decrypt text
app.post('/decrypt', async (req, res) => {
    const { encryptedText, key } = req.body;

    if (!encryptedText || !key) {
        return res.status(400).json({ error: 'Encrypted text and key are required' });
    }

    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (decrypted) {
        res.json({ decryptedText: decrypted });
    } else {
        res.status(400).json({ error: 'Decryption failed. Check the key.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
