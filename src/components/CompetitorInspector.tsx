'use client';

import React, { useState } from 'react';
import {
  Search,
  Clock,
  Tag,
  FolderTree,
  FileText,
  Calendar,
  Globe2,
  Video,
  Copy,
  Check,
  ExternalLink,
  Users,
  Eye,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download,
  Table as TableIcon,
  Play
} from 'lucide-react';

interface ChannelVideoRow {
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  publishTimeLocal: string;
  duration: string;
  category: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  totalLanguages: number;
  tags: string;
  tagsArray: string[];
}

export function CompetitorInspector({
  onImportToScorer,
}: {
  onImportToScorer?: (data: { title: string; description: string; tags: string; thumbnailUrl: string }) => void;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Copied states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengambil data kompetitor.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper untuk memastikan format durasi selalu 00:00:00 (Jam:Menit:Detik)
  const formatDurationHMS = (dur: string): string => {
    if (!dur || dur === '-') return '00:00:00';
    const parts = dur.trim().split(':');
    if (parts.length === 2) {
      return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    if (parts.length === 3) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
    }
    return dur;
  };

  // Export CSV for the table
  const exportToCSV = (videos: ChannelVideoRow[]) => {
    const headers = ['Judul', 'Tanggal Publish Lokal', 'Durasi', 'Kategori', 'View Count', 'Like Count', 'Comment Count', 'Total Languages', 'Tags', 'Video URL'];
    const rows = videos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.publishTimeLocal}"`,
      `"${formatDurationHMS(v.duration)}"`,
      `"${v.category}"`,
      `"${v.viewCount}"`,
      `"${v.likeCount}"`,
      `"${v.commentCount}"`,
      v.totalLanguages,
      `"${v.tags.replace(/"/g, '""')}"`,
      `"${v.url}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `competitor_channel_videos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Spy & Audit Kompetitor YouTube
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Bongkar Rahasia Judul, Tag, Jam Upload & Jam Tayang Kompetitor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Masukkan link video untuk membedah detail 1 video, atau masukkan link channel (misal <span className="text-rose-400 font-mono">youtube.com/@nama</span>) untuk membedah <strong>tabel seluruh video</strong> (Jam Upload, Durasi, Views, Likes, Comments, Kategori & Tag).
          </p>
        </div>

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste link video (youtube.com/watch?v=...) atau link channel (youtube.com/@nama)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengaudit Data...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Audit Sekarang
              </>
            )}
          </button>
        </form>

        {/* Quick Examples */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400">
          <span>Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => {
              setUrlInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
          >
            Contoh Link Video
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlInput('https://www.youtube.com/@LofiGirl');
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
          >
            Contoh Link Channel (Tabel Lengkap)
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 1. HASIL JIKA MEMASUKKAN LINK VIDEO */}
      {result && result.type === 'video' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Jam & Waktu Upload</span>
              </div>
              <div className="text-lg font-bold text-white">
                {result.uploadTimeFormatted}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {result.uploadDayFormatted}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <FolderTree className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Kategori Video</span>
              </div>
              <div className="text-lg font-bold text-white truncate" title={result.category}>
                {result.category}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {result.views} views terdaftar
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Globe2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Lokasi & Pembuatan</span>
              </div>
              <div className="text-lg font-bold text-white truncate">
                {result.channelCountry}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {result.channelCreatedDate.startsWith('Bergabung') ? result.channelCreatedDate : `Bergabung: ${result.channelCreatedDate}`}
              </div>
            </div>

            {/* Kekuatan Channel dengan Subscriber Jelas */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg border-rose-500/30">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Kekuatan Channel</span>
              </div>
              <div className="text-lg font-bold text-white truncate">
                {result.channelSubscriberCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total: {result.channelTotalVideos}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-4 border border-slate-800">
                  <img
                    src={result.thumbnailUrl}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    Jam Upload: {result.uploadTimeFormatted}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-slate-400">
                    Channel: <strong className="text-white">{result.channelTitle}</strong>
                  </span>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Buka di YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Judul ({result.title.length} Karakter)</span>
                    <button
                      onClick={() => handleCopy(result.title, 'title')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy Judul"
                    >
                      {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-white leading-relaxed">
                    {result.title}
                  </p>
                </div>

                {onImportToScorer && (
                  <button
                    onClick={() => {
                      onImportToScorer({
                        title: result.title,
                        description: result.description,
                        tags: result.tags.join(', '),
                        thumbnailUrl: result.thumbnailUrl,
                      });
                    }}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <span>Impor ke Evaluator G1FThumb untuk Tes Skor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Tag Video Kompetitor ({result.tags.length} Tag Ditemukan)
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopy(result.tags.join(', '), 'tags')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700"
                  >
                    {copiedField === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'tags' ? 'Tersalin!' : 'Copy Semua Tag'}</span>
                  </button>
                </div>

                {result.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
                    {result.tags.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-mono transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    Video ini tidak memasang tag khusus di metadata.
                  </p>
                )}
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Deskripsi Video Kompetitor
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopy(result.description, 'desc')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors border border-slate-700"
                  >
                    {copiedField === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'desc' ? 'Tersalin!' : 'Copy Deskripsi'}</span>
                  </button>
                </div>

                {result.hashtags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {result.hashtags.map((ht: string, i: number) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        {ht}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {result.description || 'Tidak ada deskripsi.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HASIL JIKA MEMASUKKAN LINK CHANNEL: TABEL LENGKAP SEPERTI GAMBAR 2 & 3 */}
      {result && result.type === 'channel' && (
        <div className="space-y-6">
          {/* Header Ringkasan Channel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-800">
              <img
                src={result.avatarUrl}
                alt={result.channelTitle}
                className="w-20 h-20 rounded-full border-2 border-slate-700 object-cover shadow-lg"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{result.channelTitle}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    {result.channelSubscriberCount}
                  </span>
                </div>
                <a
                  href={result.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 mb-3"
                >
                  {result.channelUrl} <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                  <span>Total Video: <strong className="text-white">{result.channelTotalVideos}</strong></span>
                  <span>•</span>
                  <span>Lokasi: <strong className="text-white">{result.channelCountry}</strong></span>
                  <span>•</span>
                  <span><strong>{result.channelCreatedDate.startsWith('Bergabung') ? result.channelCreatedDate : `Bergabung Pada: ${result.channelCreatedDate}`}</strong></span>
                  <span>•</span>
                  <span>Total Views: <strong className="text-white">{result.channelTotalViews}</strong></span>
                </div>
              </div>

              {result.videos && result.videos.length > 0 && (
                <button
                  onClick={() => exportToCSV(result.videos)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-2 border border-slate-700 self-center sm:self-auto cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Excel/CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* TABEL VIDEO PERSIS SEPERTI GAMBAR KE 2 & 3 USER */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Tabel Analisis Video Channel ({result.videos ? result.videos.length : 0} Video Terbaru)
                </h3>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Scroll horizontal untuk melihat seluruh kolom (Views, Likes, Comments, Tags)
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-bold">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 min-w-[320px]">Judul</th>
                    <th className="py-3 px-3 min-w-[150px]">Tanggal Publish Lokal</th>
                    <th className="py-3 px-3 min-w-[90px]">Durasi</th>
                    <th className="py-3 px-3 min-w-[90px]">Kategori</th>
                    <th className="py-3 px-3 min-w-[90px]">View Count</th>
                    <th className="py-3 px-3 min-w-[80px]">Like Count</th>
                    <th className="py-3 px-3 min-w-[90px]">Comment Count</th>
                    <th className="py-3 px-3 min-w-[70px] text-center">Total Languages</th>
                    <th className="py-3 px-3 min-w-[280px]">Tags</th>
                    <th className="py-3 px-3 text-center min-w-[80px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {result.videos && result.videos.length > 0 ? (
                    result.videos.map((v: ChannelVideoRow, idx: number) => (
                      <tr key={v.videoId} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-2.5 px-3 text-slate-500 text-center font-sans">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          <div className="line-clamp-2" title={v.title}>
                            {v.title}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{v.publishTimeLocal}</td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{formatDurationHMS(v.duration)}</td>
                        <td className="py-2.5 px-3 text-indigo-300 font-sans whitespace-nowrap">{v.category}</td>
                        <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">{v.viewCount}</td>
                        <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">{v.likeCount}</td>
                        <td className="py-2.5 px-3 text-amber-400 whitespace-nowrap">{v.commentCount}</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">{v.totalLanguages}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          <div className="line-clamp-2 text-[11px]" title={v.tags}>
                            {v.tags}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white inline-flex items-center justify-center transition-colors"
                            title="Tonton di YouTube"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                        Tidak ada video yang ditemukan atau sedang diproses.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
