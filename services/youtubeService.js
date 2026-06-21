import axios from 'axios';
import ytSearch from 'yt-search';

// cache
const cache = new Map();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cobalt(url) {
    try {
        const res = await axios.post(
            'https://api.cobalt.tools/api/json',
            { url, isAudioOnly: true, aFormat: 'mp3' },
            { timeout: 8000 }
        );
        return res.data?.url || null;
    } catch {
        return null;
    }
}

async function siputzx(url) {
    try {
        const res = await axios.get(
            `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`,
            { timeout: 8000 }
        );
        return res.data?.data?.dl || null;
    } catch {
        return null;
    }
}

// TU SISTEMA (pero encapsulado como fallback)
async function raceApis(url, apis) {
    for (const api of apis) {
        try {
            const r = await api(url);
            if (r) return r;
        } catch {}
    }
    return null;
}

export const downloadYoutubeAudio = async (query) => {

    if (cache.has(query)) return cache.get(query);

    const search = await ytSearch(query);
    const video = search.videos?.[0];

    if (!video) {
        return { status: false, message: "No se encontró video" };
    }

    let audio = null;

    // 🔥 LAYER 1 (rápido)
    audio = await cobalt(video.url);
    if (!audio) audio = await siputzx(video.url);

    // 🔥 LAYER 2 (tu sistema pesado)
    if (!audio) {
        audio = await raceApis(video.url, [
            async () => global.Apis?.apiCausa,
            async () => global.Apis?.deliriusApi
        ]);
    }

    if (!audio) {
        return {
            status: false,
            message: "Todas las rutas fallaron"
        };
    }

    const result = {
        status: true,
        title: video.title,
        url: video.url,
        audio
    };

    cache.set(query, result);
    setTimeout(() => cache.delete(query), 600000);

    return result;
};
