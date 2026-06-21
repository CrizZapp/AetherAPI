import axios from 'axios';
import ytSearch from 'yt-search';

// =======================
// CACHE SIMPLE EN MEMORIA
// =======================
const cache = new Map();

// =======================
// HELPERS
// =======================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function normalizeVideo(video) {
    return {
        title: video.title,
        url: video.url,
        id: video.videoId,
        author: video.author?.name || "Desconocido"
    };
}

// =======================
// PROVIDER 1 - COBALT
// =======================
async function cobalt(url) {
    const res = await axios.post(
        'https://api.cobalt.tools/api/json',
        {
            url,
            isAudioOnly: true,
            aFormat: 'mp3'
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 12000
        }
    );

    return res.data?.url || null;
}

// =======================
// PROVIDER 2 - SIPUTZX
// =======================
async function siputzx(url) {
    const endpoint = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await axios.get(endpoint, { timeout: 10000 });

    return res.data?.data?.dl || null;
}

// =======================
// MAIN FUNCTION
// =======================
export const downloadYoutubeAudio = async (query) => {
    try {

        // =======================
        // CACHE HIT
        // =======================
        if (cache.has(query)) {
            return cache.get(query);
        }

        // =======================
        // SEARCH SAFE
        // =======================
        const search = await ytSearch({ query, pages: 1 });
        const video = search.videos?.[0];

        if (!video) {
            return { status: false, message: "No se encontró el video en YouTube." };
        }

        const data = normalizeVideo(video);

        let audio = null;

        // =======================
        // PROVIDER CHAIN (CONTROLADO)
        // =======================

        try {
            audio = await cobalt(data.url);
            if (!audio) throw new Error("Cobalt vacío");
        } catch (e) {
            console.log("[AETHER] Cobalt falló → fallback...");
            await sleep(500);
        }

        if (!audio) {
            try {
                audio = await siputzx(data.url);
            } catch (e) {
                console.log("[AETHER] Siputzx falló...");
            }
        }

        if (!audio) {
            return {
                status: false,
                message: "Todas las rutas de extracción fallaron."
            };
        }

        const result = {
            status: true,
            title: data.title,
            audio,
            url: data.url,
            author: data.author
        };

        // =======================
        // CACHE 10 MIN
        // =======================
        cache.set(query, result);
        setTimeout(() => cache.delete(query), 10 * 60 * 1000);

        return result;

    } catch (error) {
        console.error("[AETHER ERROR]", error.message);
        return {
            status: false,
            message: "Error interno del servidor."
        };
    }
};
