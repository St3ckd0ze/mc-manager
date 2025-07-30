const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const router = express.Router();

const rootPath = '/mnt/backup/minecraft_backups';

// Route: Liste Dateien und Ordner inkl. Dateigröße
router.get('/list', async (req, res) => {
    const subPath = req.query.path || '';
    const absPath = path.join(rootPath, subPath);

    if (!absPath.startsWith(rootPath)) {
        return res.status(400).json({ error: 'Ungültiger Pfad' });
    }

    try {
        const files = await fsp.readdir(absPath, { withFileTypes: true });

        const entries = await Promise.all(files.map(async (f) => {
            const entryPath = path.join(absPath, f.name);
            let size = null;

            if (f.isFile()) {
                try {
                    const stats = await fsp.stat(entryPath);
                    size = stats.size; // Größe in Bytes
                } catch (err) {
                    console.error(`Fehler beim Lesen der Größe von ${entryPath}:`, err);
                }
            }

            return {
                name: f.name,
                isDirectory: f.isDirectory(),
                size // null bei Ordnern
            };
        }));

        res.json({ path: subPath, entries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fehler beim Lesen des Verzeichnisses' });
    }
});


// Route: Download einzelner Dateien
router.get('/download', (req, res) => {
    const filePath = req.query.path;
    if (!filePath) {
        return res.status(400).json({ error: 'Pfad der Datei fehlt' });
    }

    const absPath = path.join(rootPath, filePath);

    if (!absPath.startsWith(rootPath)) {
        return res.status(400).json({ error: 'Ungültiger Pfad' });
    }

    fs.stat(absPath, (err, stats) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ error: 'Datei nicht gefunden' });
        }
        if (!stats.isFile()) {
            return res.status(400).json({ error: 'Kein gültiger Dateipfad' });
        }

        req.on('aborted', () => {
            console.warn('Request aborted beim Download:', filePath);
        });

        res.download(absPath, filePath, (err) => {
            if (err && !res.headersSent) {
                console.error('Fehler beim Senden der Datei:', err);
                res.status(500).json({ error: 'Fehler beim Herunterladen der Datei' });
            }
        });
    });
});

// 🆕 Route: View für .log-Dateien im Browser
router.get('/view', async (req, res) => {
    const filePath = req.query.path;
    if (!filePath || typeof filePath !== 'string') {
        return res.status(400).send('Pfad fehlt oder ungültig.');
    }

    const absPath = path.join(rootPath, filePath);

    if (!absPath.startsWith(rootPath)) {
        return res.status(403).send('Zugriff verweigert.');
    }

    if (!absPath.endsWith('.log')) {
        return res.status(403).send('Nur .log-Dateien dürfen angezeigt werden.');
    }

    try {
        await fsp.access(absPath);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        const stream = fs.createReadStream(absPath);
        stream.pipe(res);
    } catch (err) {
        console.error('Fehler beim Anzeigen der Logdatei:', err);
        res.status(500).send('Fehler beim Laden der Datei.');
    }
});

module.exports = router;
