import { NextRequest, NextResponse } from 'next/server';

export interface CompetitorVideoData {
  type: 'video';
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO string
  uploadTimeFormatted: string; // misal "18:45:12 WIB"
  uploadDayFormatted: string; // misal "Rabu, 9 September 2026"
  views: string;
  likes: string;
  category: string;
  channelTitle: string;
  channelUrl: string;
  channelId: string;
  description: string;
  tags: string[];
  hashtags: string[];
  channelCreatedDate: string; // Tanggal bergabung
  channelCountry: string;
  channelTotalVideos: string; // Total video sebenarnya
  channelSubscriberCount: string;
}

export interface ChannelVideoRow {
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  publishTimeLocal: string; // "2026-09-08 16:30:12"
  duration: string; // "01:15:32"
  category: string; // "Music"
  viewCount: string; // "635"
  likeCount: string; // "20"
  commentCount: string; // "5"
  totalLanguages: number; // 1
  tags: string; // "blues rock, Rock mon Radio, electr..."
  tagsArray: string[];
}

export interface CompetitorChannelData {
  type: 'channel';
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  avatarUrl: string;
  bannerUrl?: string;
  channelCreatedDate: string; // "Bergabung Pada 8 Jan 2020"
  channelCountry: string; // "Prancis"
  channelTotalVideos: string; // "29 video" atau "447 video"
  channelSubscriberCount: string; // "15,8 jt subscriber"
  channelTotalViews: string; // Total view sebenarnya (misal "624.735 x ditonton")
  description: string;
  videos: ChannelVideoRow[];
}

function formatDurationISO(durationStr: string): string {
  if (!durationStr) return '00:00:00';
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return durationStr;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function parseDurationText(text: string): string {
  if (!text) return '00:00:00';
  const clean = text.trim().replace(/\./g, ':');
  const parts = clean.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return `${parts[0].toString().padStart(2, '0')}:${parts[1].toString().padStart(2, '0')}:${parts[2].toString().padStart(2, '0')}`;
  } else if (parts.length === 2) {
    return `00:${parts[0].toString().padStart(2, '0')}:${parts[1].toString().padStart(2, '0')}`;
  } else if (parts.length === 1) {
    return `00:00:${parts[0].toString().padStart(2, '0')}`;
  }
  return '00:00:00';
}

function formatDateTimeLocal(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoDate;
  }
}

function parseYouTubeUrl(urlStr: string): { type: 'video' | 'channel' | 'unknown'; id: string } {
  try {
    const trimmed = urlStr.trim();
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return { type: 'video', id: watchMatch[1] };
    }

    const handleMatch = trimmed.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/);
    if (handleMatch && handleMatch[1]) {
      return { type: 'channel', id: handleMatch[1] };
    }

    const channelMatch = trimmed.match(/youtube\.com\/(?:channel|c)\/([a-zA-Z0-9_.-]+)/);
    if (channelMatch && channelMatch[1]) {
      return { type: 'channel', id: channelMatch[1] };
    }

    if (trimmed.startsWith('@')) {
      return { type: 'channel', id: trimmed };
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { type: 'video', id: trimmed };
    }

    return { type: 'unknown', id: '' };
  } catch {
    return { type: 'unknown', id: '' };
  }
}

// Ekstrak data lengkap channel (termasuk Total Video, Total View, Tanggal Bergabung, Lokasi, Subscriber)
async function fetchChannelFullMetadata(channelQueryOrUrl: string) {
  let targetUrl = channelQueryOrUrl;
  if (!targetUrl.startsWith('http')) {
    if (targetUrl.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${targetUrl}`;
    } else {
      targetUrl = `https://www.youtube.com/@${targetUrl}`;
    }
  }

  // Gunakan Googlebot User-Agent untuk membuka halaman channel About lengkap dengan joinedDate & viewCount
  let aboutUrl = targetUrl;
  if (!aboutUrl.endsWith('/about')) {
    aboutUrl = `${aboutUrl.replace(/\/videos$/, '').replace(/\/$/, '')}/about`;
  }

  let channelTitle = '';
  let avatarUrl = '';
  let channelCreatedDate = 'Tidak terdeteksi';
  let channelCountry = 'Tidak dicantumkan';
  let channelTotalVideos = 'Tidak terdeteksi';
  let channelSubscriberCount = 'Tidak ditampilkan';
  let channelTotalViews = 'Tidak terdeteksi';
  let description = '';

  try {
    const res = await fetch(aboutUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const html = await res.text();

      // Channel Title
      const titleMatch = html.match(/<meta property="og:title" content="([^"]*)">/i) || html.match(/<title>([^<]*)<\/title>/i);
      if (titleMatch) channelTitle = titleMatch[1].replace(' - YouTube', '').trim();

      // Avatar
      const avatarMatch = html.match(/<meta property="og:image" content="([^"]*)">/i);
      if (avatarMatch) avatarUrl = avatarMatch[1];

      // Description
      const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/i);
      if (descMatch) description = descMatch[1];

      // Country / Lokasi
      const countryMatch = html.match(/"country":\{"simpleText":"([^"]*)"\}/i) || html.match(/"country":"([^"]*)"/i);
      if (countryMatch) channelCountry = countryMatch[1];

      // Parse ytInitialData safely without regex
      let data: any = null;
      const startIdx = html.indexOf('var ytInitialData = {');
      if (startIdx !== -1) {
        const jsonStart = startIdx + 'var ytInitialData = '.length;
        const endIdx = html.indexOf(';</script>', jsonStart);
        if (endIdx !== -1) {
          try {
            data = JSON.parse(html.substring(jsonStart, endIdx));
          } catch {}
        }
      }

      if (data) {
        try {

          // 1. Ekstrak Total Video & Subs dari Header PageHeaderViewModel
          const vm = data?.header?.pageHeaderRenderer?.content?.pageHeaderViewModel;
          const metaRows = vm?.metadata?.contentMetadataViewModel?.metadataRows || [];
          for (const row of metaRows) {
            for (const part of row?.metadataParts || []) {
              const textContent = part?.text?.content || '';
              if (textContent.toLowerCase().includes('video')) {
                channelTotalVideos = textContent;
              } else if (textContent.toLowerCase().includes('subscriber')) {
                channelSubscriberCount = textContent;
              }
            }
          }

          // 2. Ekstrak Tanggal Bergabung (Bergabung Pada ...)
          // Cari joinedDateText
          const findKey = (obj: any, key: string): any => {
            if (!obj || typeof obj !== 'object') return null;
            if (key in obj) return obj[key];
            if (Array.isArray(obj)) {
              for (const item of obj) {
                const res = findKey(item, key);
                if (res !== null) return res;
              }
            } else {
              for (const v of Object.values(obj)) {
                const res = findKey(v, key);
                if (res !== null) return res;
              }
            }
            return null;
          };

          const jdt = findKey(data, 'joinedDateText');
          if (jdt) {
            if (typeof jdt === 'string') {
              channelCreatedDate = jdt.replace(/^Bergabung\s+/i, 'Bergabung Pada ');
            } else if (jdt.content) {
              channelCreatedDate = jdt.content.replace(/^Bergabung\s+/i, 'Bergabung Pada ');
            } else if (jdt.simpleText) {
              channelCreatedDate = jdt.simpleText.replace(/^Bergabung\s+/i, 'Bergabung Pada ');
            }
          }

          // 3. Ekstrak Total Views
          const findAllKeys = (obj: any, key: string): any[] => {
            const results: any[] = [];
            if (!obj || typeof obj !== 'object') return results;
            if (key in obj) results.push(obj[key]);
            if (Array.isArray(obj)) {
              for (const item of obj) results.push(...findAllKeys(item, key));
            } else {
              for (const v of Object.values(obj)) results.push(...findAllKeys(v, key));
            }
            return results;
          };

          const viewTexts = findAllKeys(data, 'viewCountText');
          for (const vt of viewTexts) {
            let str = '';
            if (typeof vt === 'string') str = vt;
            else if (vt?.simpleText) str = vt.simpleText;
            else if (vt?.content) str = vt.content;

            if (str && (str.includes('x ditonton') || str.includes('views'))) {
              // Ambil view yang bukan dari thumbnail rekomendasi kecil (biasanya angka terbesar / channel view)
              channelTotalViews = str;
            }
          }
        } catch {}
      }

      // Regex fallback jika belum ketemu
      if (channelCreatedDate === 'Tidak terdeteksi') {
        const jm = html.match(/(?:Bergabung|Joined)\s+(pada\s+[0-9]{1,2}\s+[a-zA-Z]+\s+[0-9]{4}|[0-9]{1,2}\s+[a-zA-Z]+\s+[0-9]{4}|\w+\s+[0-9]{1,2},\s+[0-9]{4})/i);
        if (jm) {
          channelCreatedDate = `Bergabung Pada ${jm[1].replace(/^pada\s+/i, '')}`;
        }
      }

      if (channelTotalViews === 'Tidak terdeteksi') {
        const vmMatch = html.match(/([0-9.,]+)\s+(?:x ditonton|views)/i);
        if (vmMatch) channelTotalViews = vmMatch[0];
      }

      if (channelTotalVideos === 'Tidak terdeteksi') {
        const vdm = html.match(/([0-9.,]+)\s+video/i);
        if (vdm) channelTotalVideos = vdm[0];
      }
    }
  } catch {}

  return {
    channelTitle,
    avatarUrl,
    channelCreatedDate,
    channelCountry,
    channelTotalVideos,
    channelSubscriberCount,
    channelTotalViews,
    description,
  };
}

// Scraping single video
async function fetchVideoDataScrape(videoId: string): Promise<CompetitorVideoData> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Gagal mengakses video YouTube.');
  }

  const html = await res.text();

  let title = '';
  const titleMatch = html.match(/<meta name="title" content="([^"]*)">/i) || html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(' - YouTube', '').trim();
  }

  let description = '';
  const descMatch = html.match(/<meta property="og:description" content="([^"]*)">/i) ||
                    html.match(/<meta name="description" content="([^"]*)">/i);
  if (descMatch) {
    description = descMatch[1].replace(/\\n/g, '\n').trim();
  }

  let tags: string[] = [];
  const keywordsMatch = html.match(/<meta name="keywords" content="([^"]*)">/i);
  if (keywordsMatch && keywordsMatch[1]) {
    tags = keywordsMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
  }

  let channelTitle = '';
  let channelUrl = '';
  const channelNameMatch = html.match(/<link itemprop="name" content="([^"]*)">/i) || html.match(/"ownerChannelName":"([^"]*)"/i);
  if (channelNameMatch) channelTitle = channelNameMatch[1];

  const channelUrlMatch = html.match(/<span itemprop="author"[\s\S]*?<link itemprop="url" href="([^"]*)">/i) || html.match(/"channelUrl":"([^"]*)"/i);
  if (channelUrlMatch) channelUrl = channelUrlMatch[1];

  let uploadDate = '';
  const dateMatch = html.match(/<meta itemprop="datePublished" content="([^"]*)">/i) ||
                    html.match(/<meta itemprop="uploadDate" content="([^"]*)">/i) ||
                    html.match(/"publishDate":"([^"]*)"/i);
  if (dateMatch) uploadDate = dateMatch[1];

  let category = 'Umum';
  const categoryMatch = html.match(/"category":"([^"]*)"/i) || html.match(/<meta property="og:video:tag" content="([^"]*)">/i);
  if (categoryMatch) category = categoryMatch[1];

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  let views = '0';
  const viewsMatch = html.match(/"viewCount":"([^"]*)"/i) || html.match(/<meta itemprop="interactionCount" content="([^"]*)">/i);
  if (viewsMatch) views = Number(viewsMatch[1]).toLocaleString('id-ID');

  let uploadTimeFormatted = 'Tidak terdeteksi';
  let uploadDayFormatted = 'Tidak terdeteksi';
  if (uploadDate) {
    try {
      const d = new Date(uploadDate);
      uploadTimeFormatted = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
      uploadDayFormatted = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {}
  }

  const hashtags = Array.from(new Set(description.match(/#[a-zA-Z0-9_\u0590-\u05ff\u0600-\u06ff]+/g) || []));

  // Subscriber extraction: cek langsung dari halaman video ini!
  let channelSubscriberCount = 'Tidak ditampilkan';
  const subAccMatch = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}/i);
  const subSimpleMatch = html.match(/"subscriberCountText":\{.*?"simpleText":"([^"]+)"/i);
  if (subAccMatch && subAccMatch[1]) {
    channelSubscriberCount = subAccMatch[1];
  } else if (subSimpleMatch && subSimpleMatch[1]) {
    channelSubscriberCount = subSimpleMatch[1];
  }

  // Ambil data akurat channel (Total Video, Bergabung Pada, Lokasi)
  let channelCreatedDate = '-';
  let channelCountry = '-';
  let channelTotalVideos = '-';

  if (channelUrl) {
    try {
      const chData = await fetchChannelFullMetadata(channelUrl);
      channelCreatedDate = chData.channelCreatedDate;
      channelCountry = chData.channelCountry;
      channelTotalVideos = chData.channelTotalVideos;
      if (channelSubscriberCount === 'Tidak ditampilkan' && chData.channelSubscriberCount !== 'Tidak ditampilkan') {
        channelSubscriberCount = chData.channelSubscriberCount;
      }
    } catch {}
  }

  return {
    type: 'video',
    videoId,
    url,
    title: title || 'Video YouTube',
    thumbnailUrl,
    uploadDate,
    uploadTimeFormatted,
    uploadDayFormatted,
    views,
    likes: 'Tersedia di YouTube',
    category,
    channelTitle: channelTitle || 'Channel YouTube',
    channelUrl: channelUrl || `https://www.youtube.com`,
    channelId: '',
    description,
    tags,
    hashtags,
    channelCreatedDate,
    channelCountry,
    channelTotalVideos,
    channelSubscriberCount,
  };
}

export const maxDuration = 60; // Izinkan hingga 60 detik di Vercel Serverless Function
export const dynamic = 'force-dynamic';


// Fetch single video details (tags, exact publish date, category, duration, likes, comments)
async function fetchVideoRowDetails(
  videoId: string,
  titleHint = '',
  initialDuration = '00:00:00',
  initialViews = '-'
): Promise<ChannelVideoRow> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  let title = titleHint;
  let publishTimeLocal = '-';
  let duration = initialDuration || '00:00:00';
  let category = 'Music / Umum';
  let viewCount = initialViews || '-';
  let likeCount = '-';
  let commentCount = '-';
  let tagsStr = '-';
  let tagsArray: string[] = [];

  // METODE 1: Panggil YouTube Innertube Player API dengan MWEB client (100% Mengembalikan keyword/tags asli video & lolos filter datacenter Vercel)
  try {
    const pController = new AbortController();
    const pTimeout = setTimeout(() => pController.abort(), 4000);

    const pRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      signal: pController.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'X-YouTube-Client-Name': '2',
        'X-YouTube-Client-Version': '2.20240101.01.00',
        'Origin': 'https://m.youtube.com',
        'Referer': `https://m.youtube.com/watch?v=${videoId}`,
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            hl: 'id',
            gl: 'ID',
            clientName: 'MWEB',
            clientVersion: '2.20240101.01.00',
            originalUrl: `https://m.youtube.com/watch?v=${videoId}`,
          },
        },
      }),
      cache: 'no-store',
    });
    clearTimeout(pTimeout);

    if (pRes.ok) {
      const pData = await pRes.json();
      const vd = pData?.videoDetails || {};
      const micro = pData?.microformat?.playerMicroformatRenderer || {};

      if (vd.title) title = vd.title;
      if (vd.viewCount) viewCount = Number(vd.viewCount).toLocaleString('id-ID');
      if (vd.lengthSeconds) {
        const s = parseInt(vd.lengthSeconds, 10);
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        duration = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (micro.publishDate) publishTimeLocal = formatDateTimeLocal(micro.publishDate);
      if (micro.category) category = micro.category;
      if (micro.likeCount) {
        likeCount = Number(micro.likeCount).toLocaleString('id-ID');
      }

      // Ambil tags/keywords asli video langsung dari videoDetails.keywords
      if (Array.isArray(vd.keywords) && vd.keywords.length > 0) {
        tagsArray = vd.keywords;
        tagsStr = tagsArray.join(', ');
      }
    }
  } catch {}

  // METODE 2: Fallback jika keywords masih kosong, panggil WEB client
  if (tagsArray.length === 0) {
    try {
      const pController = new AbortController();
      const pTimeout = setTimeout(() => pController.abort(), 3500);

      const pRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        signal: pController.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-YouTube-Client-Name': '1',
          'X-YouTube-Client-Version': '2.20240101.01.00',
          'Origin': 'https://www.youtube.com',
          'Referer': `https://www.youtube.com/watch?v=${videoId}`,
        },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              hl: 'id',
              gl: 'ID',
              clientName: 'WEB',
              clientVersion: '2.20240101.01.00',
              originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            },
          },
        }),
        cache: 'no-store',
      });
      clearTimeout(pTimeout);

      if (pRes.ok) {
        const pData = await pRes.json();
        const vd = pData?.videoDetails || {};
        const micro = pData?.microformat?.playerMicroformatRenderer || {};

        if (!title && vd.title) title = vd.title;
        if (viewCount === '-' && vd.viewCount) viewCount = Number(vd.viewCount).toLocaleString('id-ID');
        if (publishTimeLocal === '-' && micro.publishDate) publishTimeLocal = formatDateTimeLocal(micro.publishDate);
        if (category === 'Music / Umum' && micro.category) category = micro.category;
        if (likeCount === '-' && micro.likeCount) likeCount = Number(micro.likeCount).toLocaleString('id-ID');

        if (Array.isArray(vd.keywords) && vd.keywords.length > 0) {
          tagsArray = vd.keywords;
          tagsStr = tagsArray.join(', ');
        }
      }
    } catch {}
  }

  // METODE 3: Fallback ke HTML Watch Page jika tag/like masih belum lengkap
  if (tagsArray.length === 0 || likeCount === '-' || publishTimeLocal === '-') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();

        if (!title || title === videoId) {
          const titleMatch = html.match(/<meta name="title" content="([^"]*)">/i) || html.match(/<title>([^<]*)<\/title>/i);
          if (titleMatch) title = titleMatch[1].replace(' - YouTube', '').trim();
        }

        if (publishTimeLocal === '-') {
          const dp = html.match(/<meta itemprop="datePublished" content="([^"]+)"/i) ||
                     html.match(/<meta itemprop="uploadDate" content="([^"]+)"/i) ||
                     html.match(/"publishDate":"([^"]+)"/i);
          if (dp) publishTimeLocal = formatDateTimeLocal(dp[1]);
        }

        if (duration === '00:00:00') {
          const dur = html.match(/<meta itemprop="duration" content="([^"]+)"/i);
          if (dur) duration = formatDurationISO(dur[1]);
        }

        if (category === 'Music / Umum') {
          const cat = html.match(/"category":"([^"]+)"/i);
          if (cat) category = cat[1];
        }

        if (viewCount === '-') {
          const views = html.match(/<meta itemprop="interactionCount" content="([^"]+)"/i) || html.match(/"viewCount":"([^"]+)"/i);
          if (views) viewCount = Number(views[1]).toLocaleString('id-ID');
        }

        if (likeCount === '-') {
          const likeBtnMatch = html.match(/likeButtonViewModel.*?"title":"([^"]+)"/);
          if (likeBtnMatch && likeBtnMatch[1]) {
            likeCount = likeBtnMatch[1];
          } else {
            const likes = html.match(/"likeCount":"?(\d+)"?/i) || html.match(/"defaultText":\{"accessibility":\{"accessibilityData":\{"label":"([0-9,.]+)\s+likes?"\}\}/i);
            if (likes) likeCount = Number(likes[1].replace(/,/g, '')).toLocaleString('id-ID');
          }
        }

        if (commentCount === '-') {
          const comments = html.match(/"commentCount":\{"simpleText":"([0-9,.]+)"\}/i) || html.match(/"commentsCount":\{"simpleText":"([0-9,.]+)"\}/i);
          if (comments) commentCount = comments[1];
        }

        // Tags asli dari <meta property="og:video:tag" content="...">
        if (tagsArray.length === 0) {
          const ogTags = [...html.matchAll(/<meta property="og:video:tag" content="([^"]+)">/gi)].map((m) => m[1].trim()).filter(Boolean);
          if (ogTags.length > 0) {
            tagsArray = Array.from(new Set(ogTags));
            tagsStr = tagsArray.join(', ');
          }
        }

        // Tags asli dari regex "keywords":[...]
        if (tagsArray.length === 0) {
          const km = html.match(/"keywords":(\[.*?\])/);
          if (km) {
            try {
              const parsedK = JSON.parse(km[1]);
              if (Array.isArray(parsedK) && parsedK.length > 0) {
                tagsArray = parsedK;
                tagsStr = tagsArray.join(', ');
              }
            } catch {}
          }
        }
      }
    } catch {}
  }



  return {
    videoId,
    url,
    title: (title && title !== videoId) ? title : (titleHint || videoId),
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    publishTimeLocal,
    duration: duration || '00:00:00',
    category,
    viewCount: viewCount || '-',
    likeCount,
    commentCount,
    totalLanguages: 1,
    tags: tagsStr,
    tagsArray,
  };
}

// Scraping channel page: extract list of latest uploaded videos into table format like user requested
async function fetchChannelWithVideosTable(channelQuery: string): Promise<CompetitorChannelData> {
  let targetUrl = channelQuery;
  if (!targetUrl.startsWith('http')) {
    if (targetUrl.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${targetUrl}/videos`;
    } else {
      targetUrl = `https://www.youtube.com/@${targetUrl}/videos`;
    }
  } else if (!targetUrl.includes('/videos')) {
    targetUrl = targetUrl.replace(/\/$/, '') + '/videos';
  }

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Gagal membuka halaman video channel YouTube: ${res.statusText}`);
  }

  const html = await res.text();

  // 1. Ekstrak video list dari ytInitialData menggunakan index scan yang aman
  interface RawVideoItem {
    id: string;
    title: string;
    initialViews: string;
    initialTime: string;
    initialDuration: string;
  }
  const videoItems: RawVideoItem[] = [];

  const startIdx = html.indexOf('var ytInitialData = {');
  if (startIdx !== -1) {
    try {
      const jsonStart = startIdx + 'var ytInitialData = '.length;
      const scriptEnd = html.indexOf(';</script>', jsonStart);
      const varEnd = html.indexOf(';var ', jsonStart);
      let jsonEnd = -1;
      if (varEnd !== -1 && scriptEnd !== -1) {
        jsonEnd = Math.min(varEnd, scriptEnd);
      } else if (varEnd !== -1) {
        jsonEnd = varEnd;
      } else {
        jsonEnd = scriptEnd;
      }

      if (jsonEnd !== -1) {
        const jsonStr = html.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);

        const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
        const videosTab = tabs.find(
          (t: any) =>
            t.tabRenderer?.title === 'Videos' ||
            t.tabRenderer?.title === 'Video' ||
            t.tabRenderer?.selected === true
        );
        const tabRenderer = videosTab?.tabRenderer || tabs[0]?.tabRenderer;
        const contents =
          tabRenderer?.content?.richGridRenderer?.contents ||
          tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items ||
          [];

        for (const item of contents) {
          const rir = item?.richItemRenderer?.content;
          if (rir) {
            const lvm = rir?.lockupViewModel;
            if (lvm?.contentId) {
              const vidId = lvm.contentId;
              const title = lvm?.metadata?.lockupMetadataViewModel?.title?.content || '';
              const rows = lvm?.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
              let views = '';
              let time = '';
              if (rows.length > 0) {
                const parts = rows[0]?.metadataParts || [];
                if (parts[0]?.text?.content) views = parts[0].text.content;
                if (parts[1]?.text?.content) time = parts[1].text.content;
              }

              // Extract duration dari badge thumbnail
              let duration = '00:00:00';
              const overlays =
                lvm?.contentImage?.thumbnailViewModel?.overlays ||
                lvm?.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.overlays ||
                [];
              for (const o of overlays) {
                const badge = o?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel;
                if (badge?.text) {
                  duration = parseDurationText(badge.text);
                  break;
                }
              }

              if (!videoItems.some((v) => v.id === vidId)) {
                videoItems.push({ id: vidId, title, initialViews: views, initialTime: time, initialDuration: duration });
              }
            } else if (rir?.videoRenderer?.videoId) {
              const vr = rir.videoRenderer;
              const vidId = vr.videoId;
              const title = vr?.title?.runs?.[0]?.text || '';
              const views = vr?.viewCountText?.simpleText || '';
              const time = vr?.publishedTimeText?.simpleText || '';
              const durText = vr?.lengthText?.simpleText || '';
              const duration = durText ? parseDurationText(durText) : '00:00:00';
              if (!videoItems.some((v) => v.id === vidId)) {
                videoItems.push({ id: vidId, title, initialViews: views, initialTime: time, initialDuration: duration });
              }
            }
          }
        }
      }
    } catch {}
  }

  // Fallback regex jika parser JSON tidak menemukan
  if (videoItems.length === 0) {
    const rawMatches = Array.from(new Set(html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/g) || []));
    for (const rm of rawMatches) {
      const id = rm.replace('/watch?v=', '');
      if (!videoItems.some((v) => v.id === id)) {
        videoItems.push({ id, title: '', initialViews: '', initialTime: '', initialDuration: '00:00:00' });
      }
    }
  }

  // 2. Ambil data about channel secara akurat
  const aboutData = await fetchChannelFullMetadata(targetUrl.replace('/videos', ''));

  // 3. Batasi 15 video & ambil detail per video secara paralel (batch ukuran 8)
  // Memastikan response sangat cepat (< 2-3 detik) di serverless Vercel sehingga tidak pernah timeout
  const topVideos = videoItems.slice(0, 15);
  const videoRows: ChannelVideoRow[] = [];
  const chunkSize = 8;

  for (let i = 0; i < topVideos.length; i += chunkSize) {
    const chunk = topVideos.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (v) => {
        const details = await fetchVideoRowDetails(v.id, v.title, v.initialDuration, v.initialViews);
        // Pastikan judul asli dari channel tidak tertimpa ID video
        if ((!details.title || details.title === v.id) && v.title) {
          details.title = v.title;
        }
        // Jika view count dari watch page kosong, pakai view count dari thumbnail
        if (details.viewCount === '-' && v.initialViews) {
          details.viewCount = v.initialViews;
        }
        if ((details.duration === '00:00:00' || !details.duration) && v.initialDuration) {
          details.duration = v.initialDuration;
        }
        if (details.publishTimeLocal === '-' && v.initialTime) {
          details.publishTimeLocal = v.initialTime;
        }
        return details;
      })
    );
    videoRows.push(...chunkResults);
    if (i + chunkSize < topVideos.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return {
    type: 'channel',
    channelId: '',
    channelTitle: aboutData.channelTitle || 'Channel YouTube',
    channelUrl: targetUrl.replace('/videos', ''),
    avatarUrl: aboutData.avatarUrl || 'https://www.youtube.com/favicon.ico',
    channelCreatedDate: aboutData.channelCreatedDate,
    channelCountry: aboutData.channelCountry,
    channelTotalVideos: aboutData.channelTotalVideos,
    channelSubscriberCount: aboutData.channelSubscriberCount,
    channelTotalViews: aboutData.channelTotalViews,
    description: aboutData.description,
    videos: videoRows,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL atau Link YouTube wajib diisi.' }, { status: 400 });
    }

    const parsed = parseYouTubeUrl(url);

    if (parsed.type === 'video') {
      const data = await fetchVideoDataScrape(parsed.id);
      return NextResponse.json(data);
    } else {
      const channelQuery = parsed.id || url;
      const data = await fetchChannelWithVideosTable(channelQuery);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Competitor API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses data kompetitor YouTube.' },
      { status: 500 }
    );
  }
}
