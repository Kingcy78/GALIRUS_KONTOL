const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });

const hashFilePath = 'hash.txt';

app.post('/upload', upload.single('zipFile'), (req, res) => {
    const zipFilePath = req.file.path;

    extractPasswordUsingJohnTheRipper(zipFilePath, hashFilePath, (result) => {
        res.send(result);
    });
});

function extractPasswordUsingJohnTheRipper(zipFilePath, hashFilePath, callback) {
    // Ekstrak file ZIP menggunakan zip2john
    exec(`zip2john ${zipFilePath} > ${hashFilePath}`, (error, stdout, stderr) => {
        if (error) {
            callback(`Error during zip2john: ${error.message}`);
            return;
        }
        if (stderr) {
            callback(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Stdout: ${stdout}`);

        // Menebak password menggunakan John the Ripper
        exec(`john ${hashFilePath}`, (error, stdout, stderr) => {
            if (error) {
                callback(`Error during John the Ripper: ${error.message}`);
                return;
            }
            if (stderr) {
                callback(`Stderr: ${stderr}`);
                return;
            }
            callback(`Stdout: ${stdout}`);
        });
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
