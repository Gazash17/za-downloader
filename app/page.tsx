"use client";
import React, { useState, FormEvent, useRef } from 'react';
import { Download, Link as LinkIcon, Video, Loader2, CheckCircle2, ShieldCheck, Zap, Terminal, Music, RefreshCw } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [downloadingUrl, setDownloadingUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (inputRef.current) {
      inputRef.current.blur();
    }

    if (!url) {
      setError('Error: URL_TIDAK_DITEMUKAN. Masukkan target URL!');
      return;
    }
    
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

      if (!data.success) {
        setError(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError('Error: KONEKSI_GAGAL. Server tidak merespon.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError('');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleDownloadFile = async (downloadUrl: string, quality: string, type: string = 'video') => {
    if (!downloadUrl) {
       setError(`Error: Format ${quality} tidak tersedia untuk video ini.`);
       return;
    }

    let finalUrl = downloadUrl;
    if (finalUrl.startsWith('//')) {
      finalUrl = 'https:' + finalUrl;
    } else if (finalUrl.startsWith('/')) {
      finalUrl = 'https://www.tikwm.com' + finalUrl;
    }
    
    setDownloadingUrl(finalUrl); 
    
    const rawTitle = result.title || 'Video';
    const cleanTitle = rawTitle
      .replace(/[^a-zA-Z0-9 \-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 40); 
      
    const fileName = `${cleanTitle}_TikTok_${quality}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    try {
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error('CORS Terblokir');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

    } catch (err) {
      const a = document.createElement('a');
      a.href = finalUrl;
      a.target = '_blank'; 
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingUrl(''); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono selection:bg-cyan-900 selection:text-cyan-50 overflow-x-hidden relative">
      
      {/* KUMPULAN CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes textGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: textGradient 3s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulseGlow 6s ease-in-out infinite;
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg) translateX(-150%);
          animation: shine 3s infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />

      {/* BACKGROUND ORBS MELAYANG */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] bg-cyan-600/20 blur-[120px] rounded-full animate-pulse-glow pointer-events-none -z-10"></div>
      <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] md:w-[25vw] md:h-[25vw] bg-blue-600/20 blur-[120px] rounded-full animate-pulse-glow pointer-events-none -z-10" style={{ animationDelay: '3s' }}></div>

      {/* NAVBAR */}
      <header className="bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-[0_4px_30px_rgba(8,145,178,0.1)] transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-900 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.3)] group-hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] group-hover:bg-cyan-950 transition-all duration-500">
              <Download size={18} className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
            </div>
            <h1 className="font-bold text-lg md:text-xl tracking-wider text-white group-hover:text-cyan-300 transition-colors duration-300">
              Za_<span className="text-cyan-400 animate-pulse">Downloader</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4 animate-fade-in-up delay-100 hover:scale-105 transition-transform duration-300">
            <span className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-800/50 text-xs text-cyan-200 shadow-[0_0_15px_rgba(8,145,178,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute left-4"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Sistem Online. Siap mengunduh.
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight animate-fade-in-up delay-200">
            Unduh TikTok <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-text-gradient cursor-default">
              Kualitas HD.
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Bypass & unduh video dari TikTok tanpa watermark. Tersedia opsi Video HD dan Audio MP3. Cepat & aman.
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="animate-fade-in-up delay-400 bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-slate-800/80 p-3 md:p-5 mb-8 max-w-2xl mx-auto relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(8,145,178,0.2)] transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10">
            <div className="relative flex-1 group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-500 group-focus-within/input:text-cyan-400 group-focus-within/input:scale-110 transition-all duration-300" />
              </div>
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste URL video TikTok di sini..."
                className="w-full pl-12 pr-4 py-4 md:py-3.5 bg-slate-950/80 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-100 placeholder:text-slate-500 font-sans text-sm md:text-base shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-shine bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 md:py-3.5 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 md:min-w-[160px] shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.7)] hover:-translate-y-1 active:translate-y-0 active:scale-95 font-sans text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Zap size={18} className="animate-bounce" style={{ animationDuration: '2s' }} />
                  Mulai
                </>
              )}
            </button>
          </form>
          {error && <p className="text-red-400 text-xs md:text-sm mt-4 ml-2 font-medium flex items-center gap-1.5 animate-in fade-in zoom-in duration-300"><Terminal size={14} /> {error}</p>}
        </div>

        {/* FEATURES BADGES */}
        {!result && !loading && (
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-8 md:mt-12">
            {[
              { icon: CheckCircle2, text: "Ultra HD", delay: "0s" },
              { icon: ShieldCheck, text: "Tanpa Watermark", delay: "0.2s" },
              { icon: Music, text: "Auto Audio MP3", delay: "0.4s" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-cyan-100/70 bg-slate-900/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/30 hover:text-cyan-300 hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-default animate-float shadow-lg" style={{ animationDelay: item.delay }}>
                <item.icon className="h-4 w-4 text-cyan-400" />
                <span className="text-xs md:text-sm font-semibold tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* RESULT CARD */}
        {result && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-cyan-900/30 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-out font-sans">
            <div className="flex flex-col sm:flex-row p-1.5 gap-1.5">
              
              {/* Thumbnail */}
              <div className="sm:w-2/5 relative rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 group">
                <img 
                  src={result.thumbnail} 
                  alt="Thumbnail" 
                  className="w-full h-48 sm:h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-cyan-800/50 text-cyan-400 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg group-hover:bg-cyan-950 transition-colors">
                  <Video size={12} className="animate-pulse" />
                  {result.platform}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 md:p-5 sm:w-3/5 flex flex-col justify-between bg-slate-900/40 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-2 bg-emerald-950/30 w-fit px-2.5 py-1 rounded-md border border-emerald-900/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[10px] md:text-xs text-emerald-400 font-bold tracking-wider">BERHASIL</span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-white line-clamp-2 mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-xs text-slate-400/80 mb-5 font-mono">Pilih format unduhan di bawah 👇</p>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  
                  {/* 1. Tombol HD */}
                  <button 
                    onClick={() => handleDownloadFile(result.hd, 'HD')}
                    disabled={downloadingUrl === result.hd}
                    className="btn-shine group w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_8px_25px_rgba(8,145,178,0.6)] border border-cyan-400/50 disabled:opacity-70 text-sm md:text-base hover:-translate-y-1 active:translate-y-0 active:scale-95"
                  >
                    {downloadingUrl === result.hd ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:translate-y-1 transition-transform duration-300" />}
                    Unduh HD
                  </button>

                  {/* 2. Tombol SD */}
                  <button 
                    onClick={() => handleDownloadFile(result.sd, 'SD')}
                    disabled={downloadingUrl === result.sd}
                    className="group w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 md:py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-70 text-sm md:text-base hover:-translate-y-1 active:translate-y-0 active:scale-95 hover:border-slate-500 hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                  >
                    {downloadingUrl === result.sd ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:translate-y-1 transition-transform duration-300 text-slate-400 group-hover:text-white" />}
                    Unduh Standar (SD)
                  </button>

                  {/* 3. Tombol Audio (MP3) */}
                  <button 
                    onClick={() => handleDownloadFile(result.audio, 'MP3', 'audio')}
                    disabled={downloadingUrl === result.audio}
                    className="group w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-medium py-2.5 md:py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-900/50 disabled:opacity-70 text-sm md:text-base hover:-translate-y-1 active:translate-y-0 active:scale-95 hover:border-emerald-500/50 hover:shadow-[0_5px_20px_rgba(16,185,129,0.2)]"
                  >
                    {downloadingUrl === result.audio ? <Loader2 size={18} className="animate-spin" /> : <Music size={18} className="group-hover:scale-125 transition-transform duration-300" />}
                    Unduh Audio (MP3)
                  </button>
                  
                  {/* 4. Tombol Unduh URL Lainnya */}
                  <button 
                    onClick={handleClear}
                    className="group w-full bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 font-medium py-2 md:py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs md:text-sm mt-1 active:scale-95"
                  >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                    Unduh Video Lainnya
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