// Types & Evaluators for YouTube Title, Thumbnail, Description, Hashtags, and Tags

export interface TitleScoreResult {
  score: number; // 0 - 100
  charCount: number;
  wordCount: number;
  isLengthOptimal: boolean;
  lengthStatus: 'terlalu_pendek' | 'optimal' | 'hampir_terpotong' | 'terpotong';
  lengthFeedback: string;
  hasPowerWords: boolean;
  detectedPowerWords: string[];
  hasNumbers: boolean;
  capitalizationStatus: 'normal' | 'all_caps' | 'all_lower' | 'title_case';
  capitalizationFeedback: string;
  curiosityScore: number; // 0 - 100
  recommendations: string[];
}

export interface ThumbnailAnalysisResult {
  width: number;
  height: number;
  aspectRatio: number;
  isAspectRatioValid: boolean; // ~16:9
  isResolutionGood: boolean; // >= 1280x720
  brightness: number; // 0 - 255
  contrast: number; // 0 - 100 standard deviation approx
  colorfulness: number; // 0 - 100
  safeZoneWarning: boolean; // warning if key visual in bottom-right
  thumbnailScore: number; // 0 - 100
  recommendations: string[];
}

export interface DescriptionScoreResult {
  score: number; // 0 - 100
  charCount: number;
  wordCount: number;
  firstLinesHookGood: boolean;
  firstLinesFeedback: string;
  hasTimestamps: boolean;
  hasLinks: boolean;
  hashtagsCount: number;
  hashtagsStatus: 'none' | 'optimal' | 'too_many';
  hashtagsList: string[];
  keywordRichness: number; // 0 - 100
  recommendations: string[];
}

export interface TagsScoreResult {
  score: number; // 0 - 100
  tagsList: string[];
  totalTags: number;
  totalChars: number; // Max 500 characters di YouTube
  isUnderLimit: boolean;
  hasLongTailTags: boolean; // Frasa > 1 kata
  relevanceToTitle: number; // Persentase tag yang ada hubungannya dengan kata kunci judul
  recommendations: string[];
}

export interface GlobalScoreResult {
  overallScore: number; // 0 - 100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeColor: string;
  summary: string;
  titleResult: TitleScoreResult;
  thumbnailResult: ThumbnailAnalysisResult | null;
  descriptionResult: DescriptionScoreResult;
  tagsResult: TagsScoreResult;
  synergyScore: number;
  synergyFeedback: string;
  topActionableTips: string[];
}

// Power words dalam Bahasa Indonesia & Inggris yang sering memicu CTR tinggi
const POWER_WORDS = [
  'rahasia', 'ternyata', 'terbongkar', 'jangan', 'fakta', 'misteri', 'kenapa', 'alasan', 'sebab', 'apa jadinya',
  'secret', 'revealed', 'exposed', 'never', 'truth', 'why', 'what happens',
  'cara termudah', 'trik', 'tips', 'terbukti', 'wajib', 'sebelum terlambat', 'bahaya', 'kesalahan', 'hindari',
  'how to', 'hack', 'easiest', 'proven', 'warning', 'mistake', 'stop', 'fast',
  'gila', 'syok', 'kaget', 'parah', 'terbaik', 'terburuk', 'tercepat', 'spesial', 'termahal', 'terkaya',
  'insane', 'shocking', 'best', 'worst', 'ultimate', 'crazy', 'extreme'
];

export function evaluateTitle(title: string): TitleScoreResult {
  const cleanTitle = title.trim();
  const charCount = cleanTitle.length;
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const recommendations: string[] = [];
  let score = 50;

  if (charCount === 0) {
    return {
      score: 0,
      charCount: 0,
      wordCount: 0,
      isLengthOptimal: false,
      lengthStatus: 'terlalu_pendek',
      lengthFeedback: 'Judul belum diisi.',
      hasPowerWords: false,
      detectedPowerWords: [],
      hasNumbers: false,
      capitalizationStatus: 'normal',
      capitalizationFeedback: '',
      curiosityScore: 0,
      recommendations: ['Masukkan judul video YouTube Anda untuk dianalisis.']
    };
  }

  // 1. Length Evaluation
  let lengthStatus: TitleScoreResult['lengthStatus'] = 'optimal';
  let lengthFeedback = 'Panjang judul ideal (40-60 karakter), terbaca utuh di semua perangkat.';

  if (charCount < 25) {
    lengthStatus = 'terlalu_pendek';
    lengthFeedback = 'Judul terlalu pendek. Kurang konteks untuk memancing rasa ingin tahu penonton.';
    score -= 15;
    recommendations.push('Perpanjang judul ke 40-60 karakter untuk memberikan konteks dan emosi yang lebih kuat.');
  } else if (charCount <= 60) {
    lengthStatus = 'optimal';
    score += 20;
  } else if (charCount <= 70) {
    lengthStatus = 'hampir_terpotong';
    lengthFeedback = 'Judul agak panjang. Berpotensi terpotong tanda "..." di aplikasi YouTube Mobile.';
    score += 10;
    recommendations.push('Pastikan 40 karakter pertama memuat kata kunci/hook terpenting sebelum terpotong.');
  } else {
    lengthStatus = 'terpotong';
    lengthFeedback = 'Judul terlalu panjang (>70 karakter). Pasti terpotong "..." di feed HP & sidebar.';
    score -= 10;
    recommendations.push('Pangkas kata-kata bertele-tele. Penonton HP biasanya hanya sempat membaca 40-50 karakter pertama.');
  }

  // 2. Power Words
  const lowerTitle = cleanTitle.toLowerCase();
  const detectedPowerWords: string[] = [];

  for (const pw of POWER_WORDS) {
    if (lowerTitle.includes(pw) && !detectedPowerWords.includes(pw)) {
      detectedPowerWords.push(pw);
    }
  }

  const hasPowerWords = detectedPowerWords.length > 0;
  if (hasPowerWords) {
    score += Math.min(20, detectedPowerWords.length * 10);
  } else {
    recommendations.push('Gunakan Power Words emosional atau pemicu rasa penasaran (misal: "Ternyata", "Rahasia", "Kesalahan Fatal").');
  }

  // 3. Numbers presence
  const hasNumbers = /\d+/.test(cleanTitle);
  if (hasNumbers) {
    score += 10;
  } else {
    recommendations.push('Coba sisipkan angka spesifik jika relevan (misal: "3 Cara...", "Dalam 7 Hari", "Rp 100 Juta").');
  }

  // 4. Capitalization Style
  let capitalizationStatus: TitleScoreResult['capitalizationStatus'] = 'normal';
  let capitalizationFeedback = 'Format huruf seimbang dan nyaman dibaca.';

  const isAllUpper = cleanTitle === cleanTitle.toUpperCase() && /[A-Z]/.test(cleanTitle);
  const isAllLower = cleanTitle === cleanTitle.toLowerCase() && /[a-z]/.test(cleanTitle);

  if (isAllUpper) {
    capitalizationStatus = 'all_caps';
    capitalizationFeedback = 'Semua huruf kapital (ALL CAPS) terkesan berteriak / spammy bagi sebagian audiens.';
    score -= 10;
    recommendations.push('Gunakan huruf kapital hanya pada 1-2 kata kunci penekanan, bukan seluruh judul.');
  } else if (isAllLower) {
    capitalizationStatus = 'all_lower';
    capitalizationFeedback = 'Semua huruf kecil membuat judul terlihat kurang profesional & kurang menonjol.';
    score -= 5;
    recommendations.push('Gunakan Title Case atau kapitalisasi huruf pertama di setiap kata penting.');
  } else {
    score += 5;
  }

  // 5. Curiosity / Hook Score
  let curiosityScore = 40;
  if (hasPowerWords) curiosityScore += 25;
  if (hasNumbers) curiosityScore += 15;
  if (cleanTitle.includes('?') || cleanTitle.includes('!')) curiosityScore += 10;
  if (cleanTitle.toLowerCase().startsWith('cara') || cleanTitle.toLowerCase().startsWith('kenapa') || cleanTitle.toLowerCase().startsWith('how to')) {
    curiosityScore += 10;
  }
  curiosityScore = Math.min(100, curiosityScore);

  score = Math.max(10, Math.min(100, Math.round(score)));

  return {
    score,
    charCount,
    wordCount,
    isLengthOptimal: lengthStatus === 'optimal',
    lengthStatus,
    lengthFeedback,
    hasPowerWords,
    detectedPowerWords,
    hasNumbers,
    capitalizationStatus,
    capitalizationFeedback,
    curiosityScore,
    recommendations
  };
}

export async function analyzeThumbnailImage(file: File | Blob): Promise<ThumbnailAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = width / (height || 1);
        const isAspectRatioValid = Math.abs(aspectRatio - 16 / 9) < 0.15;
        const isResolutionGood = width >= 1280 && height >= 720;

        const canvas = document.createElement('canvas');
        const sampleW = 160;
        const sampleH = 90;
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
        const data = imgData.data;

        let totalBrightness = 0;
        const brightnessArr: number[] = [];
        let totalColorfulness = 0;
        let bottomRightDetailSum = 0;
        let bottomRightPixelCount = 0;

        for (let y = 0; y < sampleH; y++) {
          for (let x = 0; x < sampleW; x++) {
            const idx = (y * sampleW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            brightnessArr.push(lum);
            totalBrightness += lum;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            totalColorfulness += sat;

            if (x >= sampleW * 0.75 && y >= sampleH * 0.75) {
              bottomRightDetailSum += Math.abs(lum - 128);
              bottomRightPixelCount++;
            }
          }
        }

        const pixelCount = sampleW * sampleH;
        const avgBrightness = totalBrightness / pixelCount;
        const avgColorfulness = (totalColorfulness / pixelCount) * 100;

        let varianceSum = 0;
        for (let i = 0; i < pixelCount; i++) {
          varianceSum += Math.pow(brightnessArr[i] - avgBrightness, 2);
        }
        const stdDev = Math.sqrt(varianceSum / pixelCount);
        const contrast = Math.min(100, Math.max(0, Math.round((stdDev / 70) * 100)));

        const recommendations: string[] = [];
        let thumbScore = 50;

        if (isAspectRatioValid) {
          thumbScore += 15;
        } else {
          thumbScore -= 20;
          recommendations.push(`Rasio gambar bukan 16:9 (saat ini ${(aspectRatio).toFixed(2)}:1). Gunakan rasio 16:9 agar tidak ada tepi hitam di YouTube.`);
        }

        if (isResolutionGood) {
          thumbScore += 10;
        } else {
          recommendations.push(`Resolusi (${width}x${height}) di bawah standar rekomendasi YouTube (1280x720 px).`);
        }

        if (avgBrightness < 60) {
          thumbScore -= 10;
          recommendations.push('Thumbnail agak gelap. Penonton cenderung mengabaikan gambar gelap saat scrolling cepat.');
        } else if (avgBrightness > 215) {
          thumbScore -= 5;
          recommendations.push('Thumbnail terlalu silau. Pastikan elemen dan teks tetap terbaca kontras.');
        } else {
          thumbScore += 10;
        }

        if (contrast < 45) {
          thumbScore -= 10;
          recommendations.push('Kontras warna thumbnail rendah. Tingkatkan kontras subjek utama agar eye-catching.');
        } else {
          thumbScore += 15;
        }

        const bottomRightAvgDetail = bottomRightDetailSum / (bottomRightPixelCount || 1);
        const safeZoneWarning = bottomRightAvgDetail > 45;
        if (safeZoneWarning) {
          recommendations.push('⚠️ Safe Zone Alert: Ada objek/teks di sudut kanan bawah yang terancam tertutup durasi video YouTube.');
        }

        thumbScore = Math.max(10, Math.min(100, Math.round(thumbScore)));

        URL.revokeObjectURL(url);
        resolve({
          width,
          height,
          aspectRatio: Number(aspectRatio.toFixed(2)),
          isAspectRatioValid,
          isResolutionGood,
          brightness: Math.round(avgBrightness),
          contrast,
          colorfulness: Math.round(avgColorfulness),
          safeZoneWarning,
          thumbnailScore: thumbScore,
          recommendations
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

// 3. Evaluasi Deskripsi (Termasuk Hashtags)
export function evaluateDescription(description: string, title: string): DescriptionScoreResult {
  const cleanDesc = description.trim();
  const charCount = cleanDesc.length;
  const words = cleanDesc.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const recommendations: string[] = [];

  if (charCount === 0) {
    return {
      score: 0,
      charCount: 0,
      wordCount: 0,
      firstLinesHookGood: false,
      firstLinesFeedback: 'Deskripsi belum diisi.',
      hasTimestamps: false,
      hasLinks: false,
      hashtagsCount: 0,
      hashtagsStatus: 'none',
      hashtagsList: [],
      keywordRichness: 0,
      recommendations: ['Tulis deskripsi video yang menjelaskan isi konten dan menyertakan kata kunci terkait.']
    };
  }

  let score = 40;

  // Cek 2-3 baris pertama (Above the Fold) sebelum tombol "Show more" / "...lainnya" di YouTube
  // YouTube menampilkan sekitar 100-150 karakter pertama di hasil pencarian & feed
  const first150 = cleanDesc.slice(0, 150).toLowerCase();
  const titleKeywords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  let keywordsInFirstLines = 0;
  for (const kw of titleKeywords) {
    if (first150.includes(kw)) {
      keywordsInFirstLines++;
    }
  }

  const firstLinesHookGood = keywordsInFirstLines > 0 && cleanDesc.length >= 100;
  let firstLinesFeedback = '2 baris awal deskripsi optimal untuk SEO YouTube.';

  if (!firstLinesHookGood) {
    if (cleanDesc.length < 100) {
      firstLinesFeedback = 'Awal deskripsi terlalu pendek. YouTube membaca 2-3 baris awal sebagai konteks terpenting.';
      score -= 10;
      recommendations.push('Perjelas 2 baris awal deskripsi dengan merangkum poin inti video sebelum tombol "...lainnya".');
    } else {
      firstLinesFeedback = '2 baris awal belum memuat kata kunci utama dari judul.';
      score += 5;
      recommendations.push('Ulangi kata kunci utama video di 1-2 kalimat awal deskripsi secara natural untuk algoritma YouTube.');
    }
  } else {
    score += 20;
  }

  // Cek Panjang Deskripsi
  if (wordCount >= 150) {
    score += 15;
  } else if (wordCount >= 60) {
    score += 10;
  } else {
    recommendations.push('Tambahkan penjelasan konten lebih detail (rekomendasi minimal 100-200 kata) untuk membantu ranking pencarian.');
  }

  // Cek Timestamps (Chapters) misal: 00:00, 01:30, 12:45
  const hasTimestamps = /\b\d{1,2}:\d{2}\b/.test(cleanDesc);
  if (hasTimestamps) {
    score += 10;
  } else {
    recommendations.push('Tambahkan timestamp bab (misal: 00:00 Intro, 02:15 Poin Utama) agar YouTube memunculkan Google Key Moments.');
  }

  // Cek Links (Call to Action)
  const hasLinks = /https?:\/\/|www\./i.test(cleanDesc);
  if (hasLinks) {
    score += 5;
  } else {
    recommendations.push('Sertakan link media sosial, subscribe channel, atau referensi di dalam deskripsi.');
  }

  // Ekstrak & Evaluasi Hashtags (#tag)
  const hashtagMatches = cleanDesc.match(/#[a-zA-Z0-9_\u0590-\u05ff\u0600-\u06ff]+/g) || [];
  const hashtagsList = Array.from(new Set(hashtagMatches));
  const hashtagsCount = hashtagsList.length;

  let hashtagsStatus: DescriptionScoreResult['hashtagsStatus'] = 'optimal';
  if (hashtagsCount === 0) {
    hashtagsStatus = 'none';
    score -= 5;
    recommendations.push('Tambahkan 3-5 hashtag relevan (misal: #TutorialYouTube #KreatorPemula) di deskripsi.');
  } else if (hashtagsCount >= 1 && hashtagsCount <= 5) {
    hashtagsStatus = 'optimal';
    score += 15;
  } else if (hashtagsCount > 15) {
    hashtagsStatus = 'too_many';
    score -= 15;
    recommendations.push('Terlalu banyak hashtag (>15 hashtag). YouTube akan mengabaikan SEMUA hashtag jika jumlahnya berlebihan.');
  } else {
    // 6 - 15 hashtags
    score += 5;
    recommendations.push('Jumlah hashtag cukup banyak (6-15). YouTube merekomendasikan 3-5 hashtag terfokus.');
  }

  // Keyword richness
  let foundKwCount = 0;
  for (const kw of titleKeywords) {
    if (cleanDesc.toLowerCase().includes(kw)) {
      foundKwCount++;
    }
  }
  const keywordRichness = titleKeywords.length > 0
    ? Math.round((foundKwCount / titleKeywords.length) * 100)
    : 50;

  score = Math.max(10, Math.min(100, Math.round(score)));

  return {
    score,
    charCount,
    wordCount,
    firstLinesHookGood,
    firstLinesFeedback,
    hasTimestamps,
    hasLinks,
    hashtagsCount,
    hashtagsStatus,
    hashtagsList,
    keywordRichness,
    recommendations
  };
}

// 4. Evaluasi Tag YouTube (Metadata Tags)
export function evaluateTags(tagsInput: string, title: string): TagsScoreResult {
  const recommendations: string[] = [];
  
  // Format input bisa berupa dipisah koma (comma-separated)
  const rawTags = tagsInput
    .split(',')
    .map((t) => t.trim().replace(/^#/, '')) // Bersihkan hashtag jika user memasukkannya
    .filter(Boolean);

  const tagsList = Array.from(new Set(rawTags));
  const totalTags = tagsList.length;
  // YouTube menghitung total karakter dari gabungan tag
  const totalChars = tagsList.join(',').length;
  const isUnderLimit = totalChars <= 500;

  if (totalTags === 0) {
    return {
      score: 0,
      tagsList: [],
      totalTags: 0,
      totalChars: 0,
      isUnderLimit: true,
      hasLongTailTags: false,
      relevanceToTitle: 0,
      recommendations: ['Masukkan tag video yang dipisahkan dengan tanda koma (misal: youtube creator, trik ctr, thumbnail tutorial).']
    };
  }

  let score = 50;

  // 1. Batas Karakter (Max 500 di YouTube)
  if (!isUnderLimit) {
    score -= 30;
    recommendations.push(`Total karakter tag (${totalChars}/500) melebihi batas YouTube! Hapus beberapa tag yang kurang relevan.`);
  } else if (totalChars < 120) {
    score -= 10;
    recommendations.push('Total karakter tag masih sedikit. Manfaatkan 250 - 450 karakter untuk menjangkau variasi pencarian.');
  } else if (totalChars >= 250 && totalChars <= 480) {
    score += 20; // Batas ideal
  } else {
    score += 10;
  }

  // 2. Jumlah Tag (Ideal 8 - 20 tags)
  if (totalTags < 5) {
    recommendations.push('Jumlah tag kurang dari 5. Tambahkan sinonim atau salah ketik (common typos) yang sering dicari penonton.');
  } else if (totalTags <= 25) {
    score += 15;
  } else {
    score -= 5;
    recommendations.push('Tag terlalu banyak dan berpotensi terlalu general. Fokus pada kata kunci spesifik.');
  }

  // 3. Long-tail tags (Frasa > 1 kata, misal: "cara membuat thumbnail menarik")
  const longTailCount = tagsList.filter((t) => t.trim().split(/\s+/).length >= 2).length;
  const hasLongTailTags = longTailCount >= 3;
  if (hasLongTailTags) {
    score += 15;
  } else {
    recommendations.push('Gunakan variasi Long-Tail Tags (frasa 2-4 kata spesifik), jangan hanya tag 1 kata yang persaingannya sangat berat.');
  }

  // 4. Relevansi dengan judul
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  let matchCount = 0;
  for (const tag of tagsList) {
    const lowerTag = tag.toLowerCase();
    for (const tw of titleWords) {
      if (lowerTag.includes(tw)) {
        matchCount++;
        break;
      }
    }
  }

  const relevanceToTitle = totalTags > 0 ? Math.round((matchCount / totalTags) * 100) : 0;
  if (relevanceToTitle >= 40) {
    score += 10;
  } else {
    recommendations.push('Pastikan ada tag yang memuat kata kunci utama yang persis sama dengan judul video.');
  }

  score = Math.max(10, Math.min(100, Math.round(score)));

  return {
    score,
    tagsList,
    totalTags,
    totalChars,
    isUnderLimit,
    hasLongTailTags,
    relevanceToTitle,
    recommendations
  };
}

// Menghitung Sinergi dan Skor Keseluruhan (Thumbnail + Judul + Deskripsi + Tags)
export function calculateGlobalScore(
  titleResult: TitleScoreResult,
  thumbResult: ThumbnailAnalysisResult | null,
  descResult: DescriptionScoreResult,
  tagsResult: TagsScoreResult,
  thumbnailText?: string
): GlobalScoreResult {
  let synergyScore = 75;
  let synergyFeedback = 'Judul, thumbnail, deskripsi, dan tag saling mendukung dengan baik.';
  const topActionableTips: string[] = [];

  // Synergy logic: cek apakah teks thumbnail sama persis dengan judul
  if (thumbResult && thumbnailText && thumbnailText.trim().length > 0) {
    const cleanThumbText = thumbnailText.trim().toLowerCase();
    const cleanTitle = titleResult.detectedPowerWords.join(' ').toLowerCase();

    if (cleanTitle.includes(cleanThumbText) && cleanThumbText.length > 15) {
      synergyScore = 55;
      synergyFeedback = 'Teks thumbnail mengulang kata yang sama dengan judul. Manfaatkan teks thumbnail untuk hook visual yang berbeda!';
      topActionableTips.push('Buat teks thumbnail singkat (2-4 kata) yang berbeda dari judul untuk efek sinergi 1-2 punch.');
    } else {
      synergyScore = 90;
      synergyFeedback = 'Teks thumbnail dan judul saling melengkapi dengan memikat.';
    }
  }

  // Pembobotan Skor YouTube:
  // Karakter penonton YouTube utamanya memutuskan klik dari:
  // - Thumbnail: 35%
  // - Title: 35%
  // - Description (SEO / Penelusuran & Algoritma): 15%
  // - Tags (Algoritma Penelusuran & Relasi): 10%
  // - Synergy: 5%
  let overallScore = 0;
  if (thumbResult) {
    overallScore = Math.round(
      titleResult.score * 0.35 +
      thumbResult.thumbnailScore * 0.35 +
      descResult.score * 0.15 +
      tagsResult.score * 0.10 +
      synergyScore * 0.05
    );
  } else {
    overallScore = Math.round(
      titleResult.score * 0.50 +
      descResult.score * 0.25 +
      tagsResult.score * 0.20 +
      synergyScore * 0.05
    );
  }

  let grade: GlobalScoreResult['grade'] = 'C';
  let gradeColor = 'text-yellow-500';

  if (overallScore >= 90) {
    grade = 'S';
    gradeColor = 'text-emerald-400';
  } else if (overallScore >= 80) {
    grade = 'A';
    gradeColor = 'text-emerald-500';
  } else if (overallScore >= 70) {
    grade = 'B';
    gradeColor = 'text-blue-500';
  } else if (overallScore >= 55) {
    grade = 'C';
    gradeColor = 'text-amber-500';
  } else {
    grade = 'D';
    gradeColor = 'text-rose-500';
  }

  let summary = '';
  if (overallScore >= 85) {
    summary = 'Sangat Siap Upload! Kombinasi Thumbnail, Judul, Deskripsi, dan Tag memiliki potensi CTR & SEO maksimal di YouTube.';
  } else if (overallScore >= 70) {
    summary = 'Kombinasi solid dan di atas rata-rata. Dengan sedikit polesan pada rekomendasi di bawah, video siap bersaing di feed.';
  } else if (overallScore >= 50) {
    summary = 'Cukup baik, tetapi ada beberapa bagian metadata (deskripsi/tag/thumbnail) yang masih perlu dilengkapi.';
  } else {
    summary = 'Perlu perbaikan sebelum upload agar video tidak sepi penonton.';
  }

  // Kumpulkan tips terpenting dari masing-masing komponen
  if (titleResult.recommendations.length > 0) topActionableTips.push(`Judul: ${titleResult.recommendations[0]}`);
  if (thumbResult && thumbResult.recommendations.length > 0) topActionableTips.push(`Thumbnail: ${thumbResult.recommendations[0]}`);
  if (descResult.recommendations.length > 0) topActionableTips.push(`Deskripsi: ${descResult.recommendations[0]}`);
  if (tagsResult.recommendations.length > 0) topActionableTips.push(`Tag: ${tagsResult.recommendations[0]}`);

  return {
    overallScore,
    grade,
    gradeColor,
    summary,
    titleResult,
    thumbnailResult: thumbResult,
    descriptionResult: descResult,
    tagsResult,
    synergyScore,
    synergyFeedback,
    topActionableTips: topActionableTips.slice(0, 4)
  };
}

