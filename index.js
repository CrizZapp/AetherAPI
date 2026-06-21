import express from 'express';
import { downloadYoutubeAudio } from './services/youtubeService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interfaz visual rápida para la raíz de AetherAPI
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#0d1117; color:#c9d1d9; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
            <div style="text-align:center;">
                <h1 style="color:#58a6ff; font-size:2.5rem; letter-spacing:-1px; margin-bottom:5px;">AETHER - API</h1>
                <p style="color:#8b949e; font-size:0.9rem; font-family:monospace;">Status: Online | Endpoint: /api/ytmp3?url=LINK</p>
            </div>
        </body>
    `);
});

// Endpoint solicitado
app.get('/api/ytmp3', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ 
            status: false, 
            message: 'Falta el parámetro "url" en la consulta.' 
        });
    }

    const result = await downloadYoutubeAudio(url);
    
    if (!result.status) {
        return res.status(500).json(result);
    }

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`[AETHER] Servidor activo en el puerto ${PORT}`);
});
