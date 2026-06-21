import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

/**
 * Obtiene la información y el enlace crudo de descarga de un audio de YouTube.
 */
export const downloadYoutubeAudio = async (urlOrQuery) => {
    try {
        // 1. Buscar el video en YouTube
        const searchResult = await yts(urlOrQuery);
        const video = searchResult.videos[0];
        
        if (!video) {
            throw new Error('No se encontró el contenido en YouTube.');
        }

        // 2. Extraer los datos crudos directo desde YouTube
        // Usamos un agente falso para que YouTube no bloquee la petición tan rápido
        const info = await ytdl.getInfo(video.url, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                }
            }
        });

        // 3. Filtrar solo los formatos de audio y elegir el mejor (suele ser mp4a o webm)
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

        if (!audioFormat || !audioFormat.url) {
             throw new Error('YouTube no devolvió un formato de audio extraíble para este video.');
        }

        // 4. Retornar la estructura pura
        return {
            status: true,
            url: video.url,
            audio: audioFormat.url, // <-- Este es el link directo a googlevideo.com
            title: video.title,
            creador: video.author.name,
            image: video.thumbnail || video.image
        };

    } catch (error) {
        console.error('[YOUTUBE SERVICE ERROR]:', error.message);
        return {
            status: false,
            message: error.message || 'Error interno al extraer la firma de YouTube.'
        };
    }
};
