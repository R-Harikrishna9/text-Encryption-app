const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/encryptionDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a schema and model for encrypted data
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
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);

    if (decrypted) {
        res.json({ decryptedText: decrypted });
    } else {
        res.status(400).json({ error: 'Decryption failed. Check the key.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
