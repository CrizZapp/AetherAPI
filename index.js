import express from 'express';
import { downloadYoutubeAudio } from './services/youtubeService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interfaz visual rápida para la raíz de AetherAPI
// Interfaz visual interactiva para la raíz de AetherAPI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AETHER API - Dashboard</title>
            <style>
                body {
                    background: #0d1117;
                    color: #c9d1d9;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    background: #161b22;
                    padding: 2rem;
                    border-radius: 10px;
                    border: 1px solid #30363d;
                    width: 100%;
                    max-width: 650px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                h1 {
                    color: #58a6ff;
                    text-align: center;
                    margin-top: 0;
                    letter-spacing: -1px;
                }
                .status-bar {
                    text-align: center;
                    font-size: 0.9em;
                    color: #8b949e;
                    margin-bottom: 25px;
                    font-family: monospace;
                    background: #0d1117;
                    padding: 8px;
                    border-radius: 5px;
                    border: 1px solid #30363d;
                }
                .input-group {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                input {
                    flex: 1;
                    padding: 12px;
                    background: #010409;
                    border: 1px solid #30363d;
                    color: #c9d1d9;
                    border-radius: 6px;
                    outline: none;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }
                input:focus {
                    border-color: #58a6ff;
                }
                button {
                    padding: 0 20px;
                    background: #238636;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 1rem;
                    transition: background 0.2s;
                }
                button:hover {
                    background: #2ea043;
                }
                button:disabled {
                    background: #194622;
                    color: #8b949e;
                    cursor: not-allowed;
                }
                .terminal {
                    background: #010409;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #30363d;
                    min-height: 200px;
                    max-height: 400px;
                    overflow-y: auto;
                    font-family: 'Courier New', Courier, monospace;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>AETHER - API</h1>
                <div class="status-bar">
                    🟢 Status: Online | Método: GET | Endpoint: /api/ytmp3
                </div>
                
                <div class="input-group">
                    <input type="text" id="queryInput" placeholder="Pega un enlace o escribe una búsqueda de YouTube..." autocomplete="off">
                    <button id="testBtn" onclick="testAPI()">Ejecutar</button>
                </div>

                <div class="terminal" id="output" style="color: #8b949e;">// Esperando consulta...
// Ingresa un término arriba y presiona Ejecutar o la tecla Enter.</div>
            </div>

            <script>
                async function testAPI() {
                    const input = document.getElementById('queryInput').value;
                    const output = document.getElementById('output');
                    const btn = document.getElementById('testBtn');

                    if (!input.trim()) {
                        output.innerHTML = '<span style="color: #ff7b72;">[!] Error: Debes ingresar un enlace o término de búsqueda.</span>';
                        return;
                    }

                    // Estado de carga
                    btn.disabled = true;
                    btn.innerText = 'Procesando...';
                    output.innerHTML = '<span style="color: #d2a8ff;">> Fetching /api/ytmp3?url=' + encodeURIComponent(input) + '\\n> Extrayendo audio, por favor espera... ⏳</span>';

                    try {
                        const startTime = Date.now();
                        const response = await fetch('/api/ytmp3?url=' + encodeURIComponent(input));
                        const data = await response.json();
                        const ping = Date.now() - startTime;
                        
                        // Formatear el JSON para que se vea estructurado
                        const jsonStr = JSON.stringify(data, null, 4);
                        
                        // Colorear según si el status es true o false
                        if (data.status) {
                            output.innerHTML = '<span style="color: #8b949e;">// Respuesta en ' + ping + 'ms</span>\\n<span style="color: #7ee787;">' + jsonStr + '</span>';
                        } else {
                            output.innerHTML = '<span style="color: #8b949e;">// Respuesta en ' + ping + 'ms</span>\\n<span style="color: #ff7b72;">' + jsonStr + '</span>';
                        }
                    } catch (error) {
                        output.innerHTML = '<span style="color: #ff7b72;">[!] Error crítico de red o de servidor:\\n' + error.message + '</span>';
                    } finally {
                        // Restaurar el botón
                        btn.disabled = false;
                        btn.innerText = 'Ejecutar';
                    }
                }

                // Disparar búsqueda usando la tecla Enter
                document.getElementById('queryInput').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        testAPI();
                    }
                });
            </script>
        </body>
        </html>
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
