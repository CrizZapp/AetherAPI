import axios from 'axios';
import ytSearch from 'yt-search';

export const downloadYoutubeAudio = async (query) => {
    try {
        // 1. Conseguir el link del video (yt-search casi nunca falla)
        const search = await ytSearch(query);
        const video = search.videos?.[0];

        if (!video) {
            return { status: false, message: "No se encontró el video en YouTube." };
        }

        try {
            // 2. Intentar con el Rey actual: API de Cobalt
            const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
                url: video.url,
                isAudioOnly: true,
                aFormat: 'mp3'
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': 'https://cobalt.tools',
                    'Referer': 'https://cobalt.tools/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 10000 // Le damos 10 segs porque hace bypass de encriptación
            });

            if (cobaltResponse.data && cobaltResponse.data.url) {
                return {
                    status: true,
                    title: video.title,
                    audio: cobaltResponse.data.url,
                    url: video.url
                };
            }
        } catch (err) {
            console.log("[AETHER] Cobalt falló o tardó demasiado, rotando al plan B...");
        }

        // 3. Plan B: API de Siputzx (Muy usada y estable en la comunidad de bots)
        try {
            const backupApi = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`;
            const siputzxResponse = await axios.get(backupApi, { timeout: 8000 });
            
            // La API de Siputzx devuelve el enlace dentro de data.dl
            if (siputzxResponse.data?.data?.dl) {
                return {
                    status: true,
                    title: video.title,
                    audio: siputzxResponse.data.data.dl,
                    url: video.url
                };
            }
        } catch (e) {
            console.log("[AETHER] El Plan B también rebotó...");
        }

        // Si estamos aquí, Render y las APIs se rindieron
        return { status: false, message: "Todas las rutas de extracción fallaron. Intenta con otra canción." };

    } catch (error) {
        console.error("[AETHER ERROR CRÍTICO] -", error.message);
        return { status: false, message: "Error interno del servidor procesando la solicitud." };
    }
};
