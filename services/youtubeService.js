import yts from 'yt-search';
import axios from 'axios';

/**
 * Obtiene la información y el enlace de descarga de un audio de YouTube.
 */
export const downloadYoutubeAudio = async (urlOrQuery) => {
    try {
        // 1. Buscar el video en YouTube
        const searchResult = await yts(urlOrQuery);
        const video = searchResult.videos[0];
        
        if (!video) {
            throw new Error('No se encontró el contenido en YouTube.');
        }

        // 2. Ejecutar el extractor real para obtener el MP3
        const audioLinkDirecto = await extractMp3Link(video.url);

        if (!audioLinkDirecto) {
             throw new Error('No se pudo generar el enlace de descarga del audio.');
        }

        // 3. Retornar los datos limpios
        return {
            status: true,
            url: video.url,
            audio: audioLinkDirecto,
            title: video.title,
            creador: video.author.name,
            image: video.thumbnail || video.image
        };

    } catch (error) {
        console.error('[YOUTUBE SERVICE ERROR]:', error.message);
        return {
            status: false,
            message: error.message || 'Error interno al procesar el audio.'
        };
    }
};

// ==========================================
// MOTOR DE EXTRACCIÓN REAL
// ==========================================
async function extractMp3Link(videoUrl) {
    try {
        // Utilizamos una pasarela pública externa rápida como motor interno para AetherAPI
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        
        // Verificamos si la pasarela nos devolvió el link de descarga (dl)
        if (data && data.data && data.data.dl) {
            return data.data.dl; 
        }
        
        return null;
    } catch (e) {
        console.error('[EXTRACTOR ERROR]:', e.message);
        return null; 
    }
}
