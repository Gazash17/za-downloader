"use client";
import React, { useState, FormEvent } from 'react';
import { Download, Link as LinkIcon, Video, Loader2, CheckCircle2, ShieldCheck, Zap, Terminal, Music } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // State baru untuk mengetahui tombol mana yang sedang loading download
  const [downloadingUrl, setDownloadingUrl] = useState<string>('');

  const handleFetch = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Error: URL_TIDAK_DITEMUKAN. Masukkan target URL!');
      return;
    }
    
    // Cek di awal agar user tidak repot menunggu loading kalau salah link
    if (!url.includes('tiktok.com')) {
      setError('Error: LINK_TIDAK_VALID. Silakan masukkan link khusus dari TikTok.');
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      console.log("Data dari server:", data);

      if (!data.success) {
        setError(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError('Error: KONEKSI_GAGAL. Server tidak merespon atau periksa terminal VS Code.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  // Fungsi download yang sudah diperbarui agar memaksa download langsung & mengubah nama sesuai judul
  const handleDownloadFile = async (downloadUrl: string, quality: string, type: string = 'video') => {
    if (!downloadUrl) return;
    
    setDownloadingUrl(downloadUrl); // Aktifkan animasi loading di tombol
    
    // 1. Bersihkan judul video agar aman dijadikan nama file (Hapus spasi dan simbol aneh)
    const rawTitle = result.title || 'Video';
    const cleanTitle = rawTitle
      .replace(/[^a-zA-Z0-9 \-]/g, '') // Hapus simbol aneh (emoji dll)
      .trim()
      .replace(/\s+/g, '_') // Ganti spasi dengan garis bawah (_)
      .substring(0, 40); // Batasi panjang nama file maksimal 40 karakter agar tidak error
      
    // Format nama file baru: JudulVideo_TikTok_HD.mp4
    const fileName = `${cleanTitle}_TikTok_${quality}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    try {
      // Teknik untuk memaksa download file lintas-server (mencegah tab baru terbuka)
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('CORS Terblokir');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName; // Memberi nama file baru dari judul asli
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

    } catch (err) {
      // Jika keamanan browser (CORS) sangat ketat dan memblokir fetch di atas,
      // ini adalah rencana cadangan (buka tab baru tapi tetap berusaha kasih nama)
      console.warn("Download langsung diblokir browser, menggunakan tab cadangan.");
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingUrl(''); // Matikan animasi loading
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono selection:bg-cyan-900 selection:text-cyan-50">
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 shadow-[0_4px_30px_rgba(8,145,178,0.1)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(8,145,178,0.2)]">
              <Download size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-wider text-white">Za_<span className="text-cyan-400">Downloader</span></h1>
          </div>
          <div className="text-xs font-semibold text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-3 py-1.5 rounded-full uppercase tracking-widest">
            v1.0.0-beta
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="animate-pulse px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              Sistem Online. Siap mengunduh.
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Unduh TikTok <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Kualitas HD.</span>
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Bypass & unduh video dari TikTok tanpa watermark. Tersedia opsi Video HD dan Audio MP3. Tanpa iklan, aman, dan cepat.
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-800 p-2 md:p-4 mb-8 max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-3 relative z-10">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Masukkan URL video TikTok di sini..."
                className="w-full pl-11 pr-4 py-4 md:py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-slate-200 placeholder:text-slate-600 font-sans"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-4 md:py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[150px] shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] font-sans"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Mulai
                </>
              )}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-3 ml-2 font-medium flex items-center gap-1"><Terminal size={14} /> {error}</p>}
        </div>

        {!result && !loading && (
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Ultra HD 4K</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Tanpa Watermark</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Auto Audio MP3</span>
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="sm:w-2/5 relative bg-slate-950 border-r border-slate-800 flex-shrink-0">
                <img 
                  src={result.thumbnail} 
                  alt="Thumbnail" 
                  className="w-full h-48 sm:h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-2 left-2 bg-slate-900/80 border border-slate-700 text-cyan-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 font-mono">
                  <Video size={12} />
                  {result.platform}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-emerald-500 font-mono tracking-wider">STATUS: BERHASIL</span>
                  </div>
                  <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 leading-tight">
                    {result.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-6 font-mono text-xs">Pilih format unduhan di bawah.</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Tombol HD Selalu Muncul (Jika ada link HD atau jika TikTok) */}
                  {(result.hd || result.platform === 'TikTok') && (
                    <button 
                      onClick={() => handleDownloadFile(result.hd || result.sd, 'HD')}
                      disabled={downloadingUrl === (result.hd || result.sd)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(8,145,178,0.3)] border border-cyan-500/50 disabled:opacity-70"
                    >
                      {downloadingUrl === (result.hd || result.sd) ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      Unduh HD
                    </button>
                  )}

                  {/* Tombol Audio (MP3) */}
                  {(result.audio || result.platform === 'TikTok') && (
                    <button 
                      onClick={() => handleDownloadFile(result.audio, 'Audio', 'audio')}
                      disabled={!result.audio || downloadingUrl === result.audio}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-emerald-900/50 disabled:opacity-70"
                    >
                      {downloadingUrl === result.audio ? <Loader2 size={18} className="animate-spin" /> : <Music size={18} />}
                      Unduh Audio (MP3)
                    </button>
                  )}
                  
                  <button 
                    onClick={handleClear}
                    className="mt-3 text-xs text-slate-500 hover:text-cyan-400 font-mono text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <Terminal size={12} /> Unduh URL Lainnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}