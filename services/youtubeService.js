import { Innertube } from 'youtubei.js';

export const downloadYoutubeAudio = async (query) => {
    const yt = await Innertube.create();

    const search = await yt.search(query);
    const video = search.videos?.[0];

    if (!video) {
        return { status: false, message: "No encontrado" };
    }

    const info = await yt.getInfo(video.id);

    const audio = info.streaming_data?.adaptive_formats
        ?.find(f => f.mime_type?.startsWith("audio"));

    if (!audio) {
        return { status: false, message: "Sin audio disponible" };
    }

    return {
        status: true,
        title: video.title.text,
        audio: audio.url,
        url: `https://youtube.com/watch?v=${video.id}`
    };
};
