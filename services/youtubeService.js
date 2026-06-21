import axios from 'axios';
import ytSearch from 'yt-search';

export const downloadYoutubeAudio = async (query) => {
    try {
        // 1. Obtenemos el link súper rápido con yt-search (Cero bloqueos aquí)
        const search = await ytSearch(query);
        const video = search.videos?.[0];

        if (!video) {
            return { status: false, message: "No se encontró el video en YouTube." };
        }

        const encodedUrl = encodeURIComponent(video.url);
        
        // 2. Pool de APIs públicas estables mantenidas por la comunidad de devs.
        // Usan proxys residenciales internos, así Render jamás queda expuesto a YouTube.
        const BOT_APIS = [
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodedUrl}`,
            `https://api.vreden.my.id/api/ytmp3?url=${encodedUrl}`,
            `https://aemt.me/download/ytdl?url=${encodedUrl}`
        ];

        let audioUrl = null;

        // 3. Sistema de rotación: si una API está saturada, salta a la siguiente al instante
        for (const api of BOT_APIS) {
            try {
                // Timeout agresivo de 5 segundos. Si un nodo no responde rápido, pasamos al siguiente.
                const { data } = await axios.get(api, { timeout: 5000 }); 
                
                // Extraemos la URL de descarga dependiendo de cómo estructure el JSON cada API
                if (data?.url) audioUrl = data.url;
                else if (data?.data?.url) audioUrl = data.data.url;
                else if (data?.result?.download?.url) audioUrl = data.result.download.url;

                if (audioUrl) break; // ¡Éxito! Rompemos el bucle y dejamos de buscar
            } catch (err) {
                console.log(`[AETHER] Nodo ocupado o inactivo, rotando al siguiente...`);
                continue; 
            }
        }

        // Si pasamos por todas las APIs y ninguna funcionó
        if (!audioUrl) {
            return { status: false, message: "Todos los nodos de extracción están saturados en este momento. Intenta de nuevo." };
        }

        // 4. Devolver la respuesta impecable
        return {
            status: true,
            title: video.title,
            audio: audioUrl,
            url: video.url
        };

    } catch (error) {
        console.error("[AETHER ERROR] -", error.message);
        return { status: false, message: "Error interno procesando la solicitud." };
    }
};
