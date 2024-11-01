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
});

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
    const encryptedText = CryptoJS.AES.encrypt(text, key).toString();

    // Save to the database
    const newEntry = new EncryptedData({ text, key, encryptedText });
    await newEntry.save();

    res.json({ encryptedText });
});

// Endpoint to decrypt text
app.post('/decrypt', async (req, res) => {
    const { encryptedText, key } = req.body;
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
