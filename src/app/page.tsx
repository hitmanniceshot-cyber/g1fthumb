'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Sliders,
  Type,
  ImageIcon,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Info,
  FileText,
  Hash,
  Tag,
  Clock,
  Link,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  evaluateTitle,
  analyzeThumbnailImage,
  evaluateDescription,
  evaluateTags,
  calculateGlobalScore,
  TitleScoreResult,
  ThumbnailAnalysisResult,
  DescriptionScoreResult,
  TagsScoreResult,
  GlobalScoreResult
} from '@/lib/evaluator';
import { YouTubePreview } from '@/components/YouTubePreview';
import { CompetitorInspector } from '@/components/CompetitorInspector';

export default function Home() {
  // Navigation Tab Mode: 'scorer' (Cek Video Sendiri) vs 'competitor' (Cek Kompetitor)
  const [mainMode, setMainMode] = useState<'scorer' | 'competitor'>('scorer');

  // 1. Input States
  const [title, setTitle] = useState<string>('CARA DAPAT 1000 SUBSCRIBER PERTAMA DALAM 7 HARI! (Trik Rahasia)');
  const [thumbnailText, setThumbnailText] = useState<string>('1000 SUBS DALAM 7 HARI!');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);

  const [description, setDescription] = useState<string>(
`Ingin tahu cara cepat dapat 1000 subscriber pertama di YouTube dalam 7 hari tanpa beli subs? Di video ini kita bongkar trik rahasia algoritma YouTube yang terbukti berhasil!

📌 TIMESTAMPS:
00:00 - Kenapa Video Kamu Sepi?
01:30 - Formula Judul & Thumbnail CTR Tinggi
04:15 - Trik Retensi Penonton 5 Menit Pertama
07:45 - Kesalahan Fatal yang Wajib Dihindari

🔔 Subscribe untuk tips YouTube mingguan: https://youtube.com/@kreatorhebat
💬 Gabung komunitas Discord kreator: https://discord.gg/kreator

#TutorialYouTube #TipsYouTuber #SubscriberGratis #AlgoritmaYouTube`
  );

  const [tagsInput, setTagsInput] = useState<string>(
    'cara dapat 1000 subscriber, tutorial youtube pemula, trik algoritma youtube, tips menambah subscriber, subscriber youtube cepat, youtube creator indonesia, cara bikin thumbnail youtube, trik seo youtube 2026'
  );

  // 2. Evaluation Results
  const [titleResult, setTitleResult] = useState<TitleScoreResult>(() => evaluateTitle(title));
  const [thumbnailResult, setThumbnailResult] = useState<ThumbnailAnalysisResult | null>(null);
  const [descResult, setDescResult] = useState<DescriptionScoreResult>(() => evaluateDescription(description, title));
  const [tagsResult, setTagsResult] = useState<TagsScoreResult>(() => evaluateTags(tagsInput, title));
  const [globalScore, setGlobalScore] = useState<GlobalScoreResult>(() =>
    calculateGlobalScore(
      evaluateTitle(title),
      null,
      evaluateDescription(description, title),
      evaluateTags(tagsInput, title),
      thumbnailText
    )
  );

  // 3. UI Controls
  const [activeTab, setActiveTab] = useState<'all' | 'title' | 'thumb' | 'desc' | 'tags'>('all');
  const [activeView, setActiveView] = useState<'desktop' | 'mobile' | 'sidebar'>('mobile');
  const [isSquintMode, setIsSquintMode] = useState<boolean>(false);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [copiedTitle, setCopiedTitle] = useState<boolean>(false);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [copiedTags, setCopiedTags] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-calculate when text inputs change
  useEffect(() => {
    const tRes = evaluateTitle(title);
    const dRes = evaluateDescription(description, title);
    const tgRes = evaluateTags(tagsInput, title);

    setTitleResult(tRes);
    setDescResult(dRes);
    setTagsResult(tgRes);

    const gRes = calculateGlobalScore(tRes, thumbnailResult, dRes, tgRes, thumbnailText);
    setGlobalScore(gRes);
  }, [title, description, tagsInput, thumbnailText, thumbnailResult]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    const objectUrl = URL.createObjectURL(file);
    setThumbnailUrl(objectUrl);
    setIsAnalyzingImage(true);

    try {
      const result = await analyzeThumbnailImage(file);
      setThumbnailResult(result);
      const gRes = calculateGlobalScore(titleResult, result, descResult, tagsResult, thumbnailText);
      setGlobalScore(gRes);

      if (gRes.overallScore >= 80) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error('Failed to analyze thumbnail:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleCopy = (text: string, type: 'title' | 'desc' | 'tags') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === 'desc') {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    } else {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  const sampleTitles = [
    '5 Kesalahan Fatal YouTuber Pemula (Jangan Lakukan Ini!)',
    'Trik Rahasia Meningkatkan View YouTube Secara Drastis',
    'Bagaimana Saya Mendapatkan $10,000 dari YouTube Tanpa Wajah',
    'Ternyata Ini Alasan Kenapa Video Kamu Sepi Penonton'
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                G1FThumb
              </span>
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest ml-2 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                PRO Suite
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setMainMode('scorer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mainMode === 'scorer'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Upload Scorer</span>
            </button>
            <button
              onClick={() => setMainMode('competitor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mainMode === 'competitor'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cek Kompetitor</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {mainMode === 'competitor' ? (
          <CompetitorInspector
            onImportToScorer={(data) => {
              setTitle(data.title);
              setDescription(data.description);
              setTagsInput(data.tags);
              if (data.thumbnailUrl) {
                setThumbnailUrl(data.thumbnailUrl);
              }
              setMainMode('scorer');
            }}
          />
        ) : (
          <>
            {/* TOP HERO: OVERALL SCORE & RADAR SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Global Score Card (4 Cols) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Pre-Upload Score
                </span>
                <span className={`text-2xl font-black ${globalScore.gradeColor} px-2.5 py-0.5 rounded-xl bg-slate-800/80 border border-slate-700/50`}>
                  Grade {globalScore.grade}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-6xl font-black tracking-tight text-white">
                  {globalScore.overallScore}
                </span>
                <span className="text-lg font-medium text-slate-500">/ 100</span>
              </div>

              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400"
                  style={{ width: `${globalScore.overallScore}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {globalScore.summary}
              </p>
            </div>

            {/* 4 Core Pillars Breakdown Mini Bars */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                  <span>🖼️ Thumbnail</span>
                  <strong className="text-white">{thumbnailResult ? thumbnailResult.thumbnailScore : '—'}</strong>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all"
                    style={{ width: `${thumbnailResult ? thumbnailResult.thumbnailScore : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                  <span>📝 Judul</span>
                  <strong className="text-white">{titleResult.score}</strong>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all"
                    style={{ width: `${titleResult.score}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                  <span>📄 Deskripsi</span>
                  <strong className="text-white">{descResult.score}</strong>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${descResult.score}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                  <span>🏷️ Tag Metadata</span>
                  <strong className="text-white">{tagsResult.score}</strong>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${tagsResult.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations & Synergy Tips (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Prioritas Tindakan Sebelum Upload</h3>
                </div>
                <span className="text-xs text-slate-400">
                  Sinergi Metadata: <strong className="text-emerald-400">{globalScore.synergyScore}/100</strong>
                </span>
              </div>

              {globalScore.topActionableTips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-2">
                  {globalScore.topActionableTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">Semua kombinasi judul, thumbnail, deskripsi, dan tag sudah berada di standar optimal!</p>
              )}
            </div>

            {/* Quick Inspiration Titles */}
            <div className="pt-3 mt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 block mb-1.5">Inspirasi Judul Penarik Penonton:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleTitles.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => setTitle(st)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
                  >
                    &ldquo;{st.length > 34 ? st.substring(0, 34) + '...' : st}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (LEFT: EDITORS, RIGHT: SIMULATOR & AUDIT CHECKLIST) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: 4 PILLARS INPUTS (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">

            {/* 1. JUDUL SECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Type className="w-4 h-4 text-rose-400" />
                  1. Judul Video YouTube
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
                    titleResult.lengthStatus === 'optimal'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : titleResult.lengthStatus === 'terpotong'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {titleResult.charCount} / 100 Karakter (Skor: {titleResult.score})
                  </span>
                  <button
                    onClick={() => handleCopy(title, 'title')}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy judul"
                  >
                    {copiedTitle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis judul video Anda di sini..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all resize-none"
              />

              {/* Title Feedback Pills */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Panjang</div>
                  <div className={`font-medium ${titleResult.isLengthOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {titleResult.lengthStatus === 'optimal' ? 'Sangat Pas' : titleResult.lengthStatus}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Power Words</div>
                  <div className={`font-medium ${titleResult.hasPowerWords ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {titleResult.detectedPowerWords.length > 0 ? `${titleResult.detectedPowerWords.length} Terdeteksi` : 'Belum Ada'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Angka Hook</div>
                  <div className={`font-medium ${titleResult.hasNumbers ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {titleResult.hasNumbers ? 'Ada Angka' : 'Tanpa Angka'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. THUMBNAIL SECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  2. Gambar Thumbnail
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Skor: {thumbnailResult ? thumbnailResult.thumbnailScore : '—'} / 100
                  </span>
                  {thumbnailFile && (
                    <button
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailUrl(null);
                        setThumbnailResult(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-5 text-center transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-2 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-white mb-0.5">
                  {thumbnailFile ? thumbnailFile.name : 'Klik / Drag Thumbnail (1280x720 16:9)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {thumbnailResult ? `Resolusi ${thumbnailResult.width}x${thumbnailResult.height} • Kontras ${thumbnailResult.contrast}%` : 'Menganalisis rasio, kontras, dan safe-zone secara otomatis'}
                </p>
              </div>

              {/* Teks di dalam Thumbnail */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Teks dalam Thumbnail (opsional untuk cek sinergi):
                </label>
                <input
                  type="text"
                  value={thumbnailText}
                  onChange={(e) => setThumbnailText(e.target.value)}
                  placeholder="Misal: 1000 SUBS DALAM 7 HARI!"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 3. DESKRIPSI & HASHTAG SECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  3. Deskripsi & Hashtag (#)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
                    descResult.score >= 75
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    Skor: {descResult.score} / 100
                  </span>
                  <button
                    onClick={() => handleCopy(description, 'desc')}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy deskripsi"
                  >
                    {copiedDesc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis deskripsi video lengkap dengan timestamps, call to action, dan hashtag..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono leading-relaxed"
              />

              {/* Description Audit Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                {/* 2 Baris Hook Awal */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Hook 2 Baris Awal</div>
                  <div className={`font-medium text-[11px] ${descResult.firstLinesHookGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {descResult.firstLinesHookGood ? '✓ Optimal' : 'Kurang Keyword'}
                  </div>
                </div>

                {/* Hashtag Count */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Hashtags (#)</div>
                  <div className={`font-medium text-[11px] ${descResult.hashtagsStatus === 'optimal' ? 'text-emerald-400' : descResult.hashtagsStatus === 'too_many' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {descResult.hashtagsCount} Tags {descResult.hashtagsStatus === 'optimal' ? '(Ideal)' : descResult.hashtagsStatus === 'too_many' ? '(Bahaya)' : ''}
                  </div>
                </div>

                {/* Timestamps / Chapters */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Timestamps</div>
                  <div className={`font-medium text-[11px] ${descResult.hasTimestamps ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {descResult.hasTimestamps ? '✓ Ada Chapter' : 'Belum Ada'}
                  </div>
                </div>

                {/* Links / CTA */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Links / CTA</div>
                  <div className={`font-medium text-[11px] ${descResult.hasLinks ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {descResult.hasLinks ? '✓ Ada Link' : 'Belum Ada'}
                  </div>
                </div>
              </div>

              {/* Hashtag Preview Tags */}
              {descResult.hashtagsList.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {descResult.hashtagsList.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. TAG METADATA SECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Tag className="w-4 h-4 text-amber-400" />
                  4. Tag YouTube (Keywords)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
                    tagsResult.isUnderLimit && tagsResult.score >= 70
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {tagsResult.totalChars} / 500 Chars (Skor: {tagsResult.score})
                  </span>
                  <button
                    onClick={() => handleCopy(tagsInput, 'tags')}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy tags"
                  >
                    {copiedTags ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <textarea
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Pisahkan tag dengan tanda koma (misal: cara dapat subscriber, tutorial youtube pemula, trik ctr)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono leading-relaxed"
              />

              {/* Tag Badges */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Total Tag</div>
                  <div className="font-medium text-slate-200">
                    {tagsResult.totalTags} Tags
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Long-Tail Tags</div>
                  <div className={`font-medium ${tagsResult.hasLongTailTags ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tagsResult.hasLongTailTags ? '✓ Ada Frasa' : 'Kurang Frasa'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Relasi Judul</div>
                  <div className="font-medium text-slate-200">
                    {tagsResult.relevanceToTitle}% Cocok
                  </div>
                </div>
              </div>

              {/* Render Tag Chips */}
              {tagsResult.tagsList.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {tagsResult.tagsList.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: LIVE SIMULATOR & AUDIT CHECKLIST (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live YouTube Simulator */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-white">Simulasi Tampilan YouTube</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSquintMode(!isSquintMode)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                      isSquintMode
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Simulasi pandangan sekilas (Squint Test) saat scrolling cepat"
                  >
                    <span>Squint / Blur Test</span>
                  </button>

                  <button
                    onClick={() => setShowSafeZones(!showSafeZones)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                      showSafeZones
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Tampilkan area safe zone durasi YouTube di pojok kanan bawah"
                  >
                    <span>Safe Zone Overlay</span>
                  </button>
                </div>
              </div>

              {/* YouTube Mockup Preview */}
              <YouTubePreview
                thumbnailUrl={thumbnailUrl}
                title={title}
                description={description}
                isSquintMode={isSquintMode}
                showSafeZones={showSafeZones}
                activeView={activeView}
                onViewChange={setActiveView}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              />
            </div>

            {/* Comprehensive Checklist Pre-Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Audit Lengkap Pre-Upload YouTube
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* 1. Judul */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {titleResult.isLengthOptimal ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>Keterbacaan Judul ({titleResult.charCount} Karakter)</span>
                  </div>
                  <span className="text-slate-400 font-mono">Skor {titleResult.score}/100</span>
                </div>

                {/* 2. Thumbnail */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {thumbnailResult ? (
                      !thumbnailResult.safeZoneWarning ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-600 block shrink-0" />
                    )}
                    <span>Safe Zone & Kontras Thumbnail</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {thumbnailResult ? `Skor ${thumbnailResult.thumbnailScore}/100` : 'Upload gambar'}
                  </span>
                </div>

                {/* 3. Deskripsi Hook 2 Baris */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {descResult.firstLinesHookGood ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>Deskripsi Above-the-Fold (150 Karakter Awal)</span>
                  </div>
                  <span className="text-slate-400 font-mono">{descResult.wordCount} Kata</span>
                </div>

                {/* 4. Hashtag Policy */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {descResult.hashtagsStatus === 'optimal' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : descResult.hashtagsStatus === 'too_many' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>Jumlah Hashtag YouTube (Rekomendasi 3-5)</span>
                  </div>
                  <span className="text-slate-400 font-mono">{descResult.hashtagsCount} / 15 Max</span>
                </div>

                {/* 5. Timestamps & Chapters */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {descResult.hasTimestamps ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>Timestamps / Bab Konten Video</span>
                  </div>
                  <span className="text-slate-400 font-mono">{descResult.hasTimestamps ? 'Aktif' : 'Tidak Ada'}</span>
                </div>

                {/* 6. Tag Karakter & Long-tail */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {tagsResult.isUnderLimit && tagsResult.hasLongTailTags ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>Tag Metadata & Long-tail Keywords</span>
                  </div>
                  <span className="text-slate-400 font-mono">{tagsResult.totalChars}/500 Karakter</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        </>
        )}
      </div>
    </main>
  );
}

