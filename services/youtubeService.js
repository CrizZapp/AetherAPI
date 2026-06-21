import axios from 'axios';
import ytSearch from 'yt-search';

// Lista de instancias públicas para evadir el bloqueo de IP
const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.flokinet.to',
    'https://invidious.jing.rocks',
    'https://invidious.nerdvpn.de'
];

export const downloadYoutubeAudio = async (query) => {
    try {
        // 1. Búsqueda ultra rápida (YouTube no suele bloquear yt-search)
        const search = await ytSearch(query);
        const video = search.videos?.[0];

        if (!video) {
            return { status: false, message: "No se encontró el video en YouTube." };
        }

        // 2. Extraer la data del video rotando instancias por si alguna cae
        let data = null;
        for (const instance of INVIDIOUS_INSTANCES) {
            try {
                // Hacemos la petición a la API pública
                const res = await axios.get(`${instance}/api/v1/videos/${video.videoId}`);
                if (res.data && res.data.adaptiveFormats) {
                    data = res.data;
                    break; // ¡Funcionó! Salimos del bucle
                }
            } catch (e) {
                // Si esta instancia falla, pasa a la siguiente en milisegundos
                continue; 
            }
        }

        if (!data) {
            return { status: false, message: "Nodos de extracción ocupados. Intenta de nuevo." };
        }

        // 3. Filtrar para agarrar solo el audio puro
        const audioTracks = data.adaptiveFormats.filter(f => f.type.includes('audio'));
        
        // Ordenar por bitrate para dar siempre la mejor calidad posible
        const bestAudio = audioTracks.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

        if (!bestAudio || !bestAudio.url) {
            return { status: false, message: "Sin track de audio disponible." };
        }

        // 4. Devolver la respuesta al formato que espera tu index.js
        return {
            status: true,
            title: video.title,
            audio: bestAudio.url,
            url: video.url
        };

    } catch (error) {
        console.error("[AETHER ERROR] -", error.message);
        return { status: false, message: "Error interno procesando la solicitud." };
    }
};
