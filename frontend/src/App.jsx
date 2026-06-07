import React, { useState, useRef, useCallback } from "react";
import {
  Leaf, ArrowRight, BadgeCheck, Gauge, Microscope, MousePointerClick,
  Camera, Wifi, Sun, BrainCircuit, FileUp, ScanSearch, ShieldCheck,
  Palette, Lightbulb, Download, RotateCcw, Clock,
  Globe, Share2, CircleDot, CheckCircle2, AlertTriangle, Sparkles,
} from "lucide-react";
import { predictFruit, API_URL } from "./api";

/* ============================================================
   DeepFruit / FrescoAI — full prototype (6 screens)
   Detection page posts to the FastAPI backend at API_URL.
   ============================================================ */

const NAV = [
  ["beranda", "Beranda"],
  ["deteksi", "Deteksi"],
  ["cara-kerja", "Cara Kerja"],
  ["panduan", "Panduan Buah"],
];

export default function App() {
  const [page, setPage] = useState("beranda");
  const go = (p) => { setPage(p); window?.scrollTo?.(0, 0); };

  return (
    <div className="root">
      <style>{CSS}</style>
      <Nav page={page} go={go} />
      {page === "beranda" && <Beranda go={go} />}
      {page === "deteksi" && <Deteksi />}
      {page === "cara-kerja" && <CaraKerja go={go} />}
      {page === "panduan" && <Panduan />}
      <Footer />
    </div>
  );
}

/* ---------- shared chrome ---------- */
function Brand({ size = "md" }) {
  return (
    <div className={"brand " + size}>
      <span className="brand-mark"><Leaf size={size === "sm" ? 14 : 17} /></span>DeepFruit
    </div>
  );
}

function Nav({ page, go }) {
  return (
    <header className="nav">
      <div onClick={() => go("beranda")} style={{ cursor: "pointer" }}><Brand /></div>
      <nav className="nav-links">
        {NAV.map(([id, label]) => (
          <a key={id} className={page === id ? "active" : ""} onClick={() => go(id)}>{label}</a>
        ))}
      </nav>
      <button className="btn btn-primary" onClick={() => go("deteksi")}>Mulai Sekarang</button>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="foot-inner">
        <div>
          <Brand />
          <p className="foot-copy">© 2024 FrescoAI. Precision Freshness Guaranteed.</p>
        </div>
        <div className="foot-links">
          <a>Kebijakan Privasi</a><a>Ketentuan Layanan</a><a>Database Buah</a><a>Hubungi Dukungan</a>
        </div>
        <div className="foot-social"><span><Globe size={16} /></span><span><Share2 size={16} /></span></div>
      </div>
    </footer>
  );
}

/* simple gradient photo placeholder (swap for real Figma assets) */
function Photo({ kind = "mix", style, children }) {
  const grad = {
    mix: "linear-gradient(135deg,#d9ead0,#bcd9b0)",
    apple: "linear-gradient(135deg,#cfe9c4,#8fbf7a)",
    greenapple: "linear-gradient(160deg,#e2f0d6,#9fc888)",
    banana: "linear-gradient(135deg,#fdf3c9,#f3dd7e)",
    mango: "linear-gradient(135deg,#fde6b8,#e9a23b)",
    orange: "linear-gradient(135deg,#dff0e6,#f3b25a)",
    pineapple: "linear-gradient(135deg,#f4f0df,#d9c87f)",
    lime: "linear-gradient(135deg,#eef6d8,#cbe07f)",
  }[kind];
  const emoji = { mix: "🍎🍊🥝", apple: "🍎", greenapple: "🍏", banana: "🍌", mango: "🥭", orange: "🍊", pineapple: "🍍", lime: "🍋" }[kind];
  return (
    <div className="photo" style={{ background: grad, ...style }}>
      <span className="photo-emoji">{emoji}</span>
      {children}
    </div>
  );
}

/* ====================== BERANDA ====================== */
function Beranda({ go }) {
  return (
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow"><BadgeCheck size={13} /> KESEGARAN ALAMI DENGAN AI</span>
          <h1>Deteksi Kelayakan <span className="g">Buah</span> dengan AI</h1>
          <p>Meningkatkan standar kualitas pangan dengan presisi teknologi Computer Vision. Analisis kesegaran, kematangan, dan kelayakan konsumsi dalam hitungan detik.</p>
          <div className="hero-cta">
            <button className="btn btn-primary lg" onClick={() => go("deteksi")}>Mulai Deteksi <ArrowRight size={16} /></button>
            <button className="btn btn-outline lg" onClick={() => go("cara-kerja")}>Lihat Demo</button>
          </div>
        </div>
        <Photo kind="mix" style={{ height: 600, borderRadius: 24 }}>
          <div className="scan-h" />
          <div className="hero-result">
            <span className="hr-check"><CheckCircle2 size={20} /></span>
            <div className="hr-mid"><small>Grade Kualitas</small><strong>Sangat Baik (A+)</strong></div>
            <div className="hr-right"><small>Tingkat Keyakinan</small><strong>99.8%</strong></div>
          </div>
        </Photo>
      </section>

      <section className="band">
        <div className="wrap center-head">
          <h2>Mengapa Memilih FrescoAI?</h2>
          <p className="lead">Kami mengintegrasikan teknologi deep learning tercanggih untuk memastikan rantai pasok buah Anda tetap segar dan berkualitas tinggi.</p>
          <div className="grid-3">
            {[
              [Gauge, "Analisis Cepat", "Dapatkan hasil analisis kualitas buah secara real-time hanya dalam hitungan milidetik setelah pengambilan gambar."],
              [Microscope, "Akurasi Tinggi", "Akurasi deteksi hingga 99% berkat dataset jutaan citra buah yang dikurasi oleh ahli botani dan agrikultur."],
              [MousePointerClick, "Mudah Digunakan", "Antarmuka yang intuitif memungkinkan siapa saja, dari petani hingga konsumen, untuk menggunakan sistem kami dengan mudah."],
            ].map(([Icon, t, d]) => (
              <div className="feature" key={t}>
                <span className="ico-mint"><Icon size={22} /></span>
                <h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap steps-asym">
        <div className="collage">
          <Photo kind="pineapple" style={{ gridArea: "a", height: 230 }} />
          <Photo kind="apple" style={{ gridArea: "b", height: 300 }} />
          <Photo kind="lime" style={{ gridArea: "c", height: 150 }} />
        </div>
        <div className="steps-list">
          <h2>Cara Kerja Kami</h2>
          {[
            ["1", "Ambil Gambar", "Gunakan kamera smartphone atau integrasikan dengan sistem CCTV gudang Anda untuk mengambil gambar buah."],
            ["2", "Analisis AI", "Algoritma FrescoAI memproses citra untuk mendeteksi cacat visual, tingkat kematangan, dan estimasi masa simpan."],
            ["3", "Laporan Instan", "Terima laporan detail mengenai kualitas dan grade buah secara otomatis dalam format digital yang mudah dibagikan."],
          ].map(([n, t, d]) => (
            <div className="step-row" key={n}>
              <span className="step-num">{n}</span>
              <div><h4>{t}</h4><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="cta-soft">
          <small>Siap Menjamin Kesegaran?</small>
          <p>Bergabunglah dengan ribuan produsen dan retailer yang telah beralih ke standar kualitas berbasis AI.</p>
          <button className="btn btn-primary lg" onClick={() => go("deteksi")}>Coba Sekarang secara Gratis</button>
        </div>
      </section>
    </main>
  );
}

/* ====================== DETEKSI ====================== */
function Deteksi() {
  const [mode, setMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [slowWarning, setSlowWarning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  // Live detection refs & state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const isBusyRef = useRef(false);
  const [liveActive, setLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState("idle"); // idle | scanning | done
  const [cameraError, setCameraError] = useState("");

  const [history, setHistory] = useState([
    { date: "Oct 24, 2023", fruit: "Nanas (Premium)", score: 92, tone: "good", kind: "pineapple" },
    { date: "Oct 23, 2023", fruit: "Pisang (Terlalu Matang)", score: 64, tone: "warn", kind: "banana" },
    { date: "Oct 21, 2023", fruit: "Jeruk (Standar)", score: 88, tone: "good", kind: "orange" },
  ]);

  // Bersihkan kamera saat ganti mode atau unmount
  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFiles = useCallback((files) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setImageUrl(URL.createObjectURL(f)); setResult(null); setStatus("idle"); setErrorMsg("");
  }, []);

  async function analyze() {
    if (!file) return;
    setStatus("loading"); setErrorMsg(""); setProgress(0); setSlowWarning(false);
    const tick = setInterval(() => setProgress((p) => Math.min(95, p + Math.random() * 18)), 220);
    const warnTimer = setTimeout(() => setSlowWarning(true), 8000);
    try {
      const data = await predictFruit(file);
      clearInterval(tick); clearTimeout(warnTimer);
      setProgress(100); setSlowWarning(false); applyResult(data);
    } catch (err) {
      clearInterval(tick); clearTimeout(warnTimer);
      setSlowWarning(false); setStatus("error");
      if (err.message === "TIMEOUT") {
        setErrorMsg("Server butuh waktu lebih lama. Coba lagi — biasanya request kedua langsung berhasil.");
      } else {
        setErrorMsg("Tidak bisa terhubung ke server AI. Pastikan koneksi internet aktif, lalu coba lagi.");
      }
    }
  }

  function applyResult(data) {
    const conf = Math.round((data.confidence ?? 0) * 100);
    if (data.status === "uncertain") {
      setResult({
        uncertain: true, score: conf,
        fruit: cap((data.fruit || "").trim()),
        advice: data.message || "Model tidak cukup yakin dengan gambar ini. Coba arahkan kamera lebih dekat dengan pencahayaan baik.",
      });
      setStatus("done");
      return;
    }
    const fresh = data.layak !== false && data.status !== "rotten";
    setResult({
      score: fresh ? Math.max(conf, 70) : Math.min(100 - conf, 60),
      fresh, fruit: cap((data.fruit || "Buah").trim()),
      grade: fresh ? "Grade A+" : "Grade C",
      variety: cap((data.fruit || "").trim()) || "Spesimen",
      skin: data.skin_integrity || (fresh ? "Sangat Baik" : "Menurun"),
      color: fresh ? ((data.color_uniformity ?? conf) + "% Cocok") : "Tidak Merata",
      advice: fresh
        ? "Spesimen ini menunjukkan integritas struktural puncak. Konsumsi optimal direkomendasikan dalam 3-5 hari. Simpan di tempat sejuk dan kering (sekitar 4°C) untuk menjaga kesegaran maksimal."
        : "Spesimen menunjukkan tanda penurunan kualitas. Tidak direkomendasikan untuk konsumsi. Pisahkan dari buah segar lainnya untuk mencegah penyebaran.",
    });
    setStatus("done");
    setHistory((h) => [{ date: today(), fruit: cap((data.fruit || "Buah").trim()), score: fresh ? Math.max(conf, 70) : Math.min(100 - conf, 60), tone: fresh ? "good" : "warn", kind: guessKind(data.fruit) }, ...h].slice(0, 4));
  }

  function demo() { applyResult({ confidence: 0.95, layak: true, status: "fresh", fruit: "apel" }); }
  function reset() { setImageUrl(null); setFile(null); setResult(null); setStatus("idle"); setProgress(0); }

  // ── Live Detection ────────────────────────────────────────
  async function startCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setLiveActive(true);
      setResult(null);
      // Scan setiap 3 detik
      intervalRef.current = setInterval(captureAndPredict, 3000);
    } catch {
      setCameraError("Kamera tidak bisa diakses. Pastikan izin kamera sudah diberikan di browser.");
    }
  }

  function stopCamera() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    isBusyRef.current = false;
    setLiveActive(false);
    setLiveStatus("idle");
  }

  function captureAndPredict() {
    if (isBusyRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      isBusyRef.current = true;
      setLiveStatus("scanning");
      try {
        const f = new File([blob], "live.jpg", { type: "image/jpeg" });
        const data = await predictFruit(f);
        applyResult(data);
        setLiveStatus("done");
      } catch {
        setLiveStatus("idle");
      } finally {
        isBusyRef.current = false;
      }
    }, "image/jpeg", 0.85);
  }

  function switchMode(m) {
    if (m === mode) return;
    stopCamera();
    reset();
    setMode(m);
  }

  return (
    <main className="wrap deteksi">
      <div className="center-head">
        <h1 className="big">Analisis Kualitas Buah</h1>
        <p className="lead">Unggah foto atau gunakan kamera langsung. Mesin neural kami mengidentifikasi kematangan dan kesegaran buah dalam hitungan detik.</p>
      </div>

      {/* Mode toggle */}
      <div className="mode-tabs">
        <button className={"mode-tab" + (mode === "upload" ? " active" : "")} onClick={() => switchMode("upload")}>
          <FileUp size={15} /> Upload Foto
        </button>
        <button className={"mode-tab" + (mode === "live" ? " active" : "")} onClick={() => switchMode("live")}>
          <Camera size={15} /> Live Detection
        </button>
      </div>

      <div className="det-grid">
        {/* Panel kiri */}
        <div className="card pad">

          {/* ── Mode Upload ── */}
          {mode === "upload" && (
            <>
              <div className={"dropzone" + (dragging ? " drag" : "") + (imageUrl ? " has" : "")}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => !imageUrl && inputRef.current?.click()}>
                {imageUrl ? (
                  <>
                    <img className="preview" src={imageUrl} alt="" />
                    {status === "loading" && <div className="scanline" />}
                    <button className="btn btn-outline sm reset" onClick={(e) => { e.stopPropagation(); reset(); }}><RotateCcw size={14} /> Ganti</button>
                  </>
                ) : (
                  <>
                    <span className="ico-mint big-ico"><FileUp size={30} /></span>
                    <h3>Letakkan gambar di sini</h3>
                    <p>Mendukung format JPG, PNG, dan RAW hingga 20MB.</p>
                    <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>Pilih dari Perangkat</button>
                  </>
                )}
                <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
              </div>
              {(status === "loading" || status === "done") && (
                <div className="progress">
                  <div className="progress-top"><span>{status === "loading" ? "Memindai..." : "Selesai"}</span><strong>{Math.round(progress)}%</strong></div>
                  <div className="bar"><div className="bar-fill" style={{ width: progress + "%" }} /></div>
                  {slowWarning && <p className="slow-warn">⏳ Server sedang bangun dari mode tidur, harap tunggu sebentar...</p>}
                </div>
              )}
              {imageUrl && status !== "loading" && status !== "done" && (
                <button className="btn btn-primary block" onClick={analyze}><ScanSearch size={16} /> Analisis Kesegaran</button>
              )}
              {status === "error" && <div className="error-box">{errorMsg}<button className="link" onClick={demo}>Lihat contoh hasil →</button></div>}
              {!imageUrl && <button className="link demo" onClick={demo}>Belum punya gambar? Lihat contoh hasil →</button>}
            </>
          )}

          {/* ── Mode Live ── */}
          {mode === "live" && (
            <>
              <div className="live-wrap">
                <video ref={videoRef} autoPlay playsInline muted className={"live-video" + (liveActive ? "" : " hidden")} />
                <canvas ref={canvasRef} hidden />
                {!liveActive && (
                  <div className="live-placeholder">
                    <span className="ico-mint big-ico"><Camera size={30} /></span>
                    <h3>Kamera Belum Aktif</h3>
                    <p>Arahkan kamera ke buah. Deteksi berjalan otomatis setiap 3 detik.</p>
                  </div>
                )}
                {liveActive && liveStatus === "scanning" && <div className="scanline" />}
                {liveActive && (
                  <div className="live-badge">
                    <span className="live-dot" /> LIVE
                  </div>
                )}
              </div>
              {cameraError && <div className="error-box" style={{ marginTop: 12 }}>{cameraError}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {!liveActive ? (
                  <button className="btn btn-primary block" onClick={startCamera}><Camera size={15} /> Mulai Kamera</button>
                ) : (
                  <button className="btn btn-outline block" onClick={stopCamera}><RotateCcw size={14} /> Stop Kamera</button>
                )}
              </div>
              {liveActive && (
                <p className="live-info">Deteksi otomatis setiap 3 detik • {liveStatus === "scanning" ? "Memindai..." : liveStatus === "done" ? "Hasil diperbarui" : "Menunggu frame..."}</p>
              )}
            </>
          )}
        </div>

        {/* results */}
        <div className="det-right">
          <div className="card pad">
            <div className="score-head">
              <div>
                <span className={"pill " + (result?.uncertain ? "amber" : "mint")}>
                  {!result ? "Menunggu" : result.uncertain ? "Tidak Yakin" : "Analisis Selesai"}
                </span>
                <h2 className="score-title">Hasil Kesegaran</h2>
              </div>
              <div className="score-num"><strong className={result && (result.uncertain || !result.fresh) ? "red" : ""}>{result ? result.score : "--"}%</strong><small>{result?.uncertain ? "KEYAKINAN" : "SKOR KUALITAS"}</small></div>
            </div>
            {(imageUrl || mode === "live") ? (
              <div className="result-img-wrap" style={{ margin: "16px 0", opacity: result && !result.uncertain ? 1 : 0.6 }}>
                {imageUrl
                  ? <img src={imageUrl} alt="Foto buah" className="result-img" />
                  : <div style={{ height: 230, background: "#0d1b2a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)", fontSize: 13 }}>{liveActive ? "Frame dianalisis dari kamera" : "Kamera belum aktif"}</div>
                }
                {result && !result.uncertain && (
                  <div className="visual-tags">
                    <span className="vt-dark">{result.grade}</span>
                    <span className="vt-light">{result.variety || "Buah"}</span>
                  </div>
                )}
              </div>
            ) : (
              <Photo kind="greenapple" style={{ height: 230, borderRadius: 16, margin: "16px 0", opacity: 0.4 }} />
            )}
            <div className="metrics">
              <div className="metric"><small>Integritas Kulit</small><span className="mv"><CheckCircle2 size={15} /> {result && !result.uncertain ? result.skin : "—"}</span></div>
              <div className="metric"><small>Keseragaman Warna</small><span className="mv"><CheckCircle2 size={15} /> {result && !result.uncertain ? result.color : "—"}</span></div>
            </div>
          </div>

          <div className="card pad">
            <h3 className="wawasan"><Lightbulb size={18} /> Wawasan AI</h3>
            <p className="advice">{result ? result.advice : "Unggah dan analisis gambar buah untuk menerima rekomendasi penyimpanan dan estimasi masa simpan dari model AI."}</p>
            <div className="row-btns">
              <button className="btn btn-outline">Simpan Laporan</button>
              <button className="btn btn-primary"><Download size={15} /> Ekspor Data</button>
            </div>
            {result && !result.uncertain && (
              <p className="estimate-note">* Skor utama berasal dari model AI (segar/busuk). Integritas kulit & keseragaman warna adalah estimasi turunan dari skor tersebut.</p>
            )}
          </div>
        </div>
      </div>

      <section className="riwayat">
        <h2 className="center-only">Riwayat</h2>
        <div className="grid-3">
          {history.map((h, i) => (
            <div className="hist" key={i}>
              <Photo kind={h.kind} style={{ width: 48, height: 48, borderRadius: 12, flex: "none" }} />
              <div className="hist-body"><small>{h.date}</small><strong>{h.fruit}</strong></div>
              <span className={"hist-score " + (h.tone === "warn" ? "red" : "green")}>{h.score}%</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ====================== CARA KERJA ====================== */
function CaraKerja({ go }) {
  return (
    <main className="wrap">
      <div className="center-head">
        <h1 className="big">Mengungkap Kesegaran Melalui Presisi AI</h1>
        <p className="lead">Hasil optimal memerlukan komponen inti ini untuk memastikan presisi AI.</p>
      </div>

      <div className="grid-3 numbered">
        {[
          [FileUp, "1", "Unggah", "Ambil atau unggah foto buah Anda dengan kualitas tinggi. Sistem kami mendukung berbagai format untuk fleksibilitas maksimal."],
          [ScanSearch, "2", "Analisis", "Model AI kami yang dilatih khusus memindai varians warna, tekstur permukaan, dan indikator kematangan dalam hitungan milidetik."],
          [BadgeCheck, "3", "Hasil", "Dapatkan laporan kualitas komprehensif dengan Grade (A-C), estimasi masa simpan, dan profil nutrisi mendetail."],
        ].map(([Icon, n, t, d]) => (
          <div className="num-step" key={n}>
            <div className="num-ico"><span className="ico-mint round"><Icon size={24} /></span><span className="num-badge">{n}</span></div>
            <h3>{t}</h3><p>{d}</p>
          </div>
        ))}
      </div>

      <div className="viz">
        <Photo kind="greenapple" style={{ height: 300, borderRadius: 16, flex: "none", width: "46%" }} />
        <div className="viz-body">
          <h2>Pemindaian Kualitas Real-time</h2>
          <div className="viz-acc"><span className="ring" /><div><strong>98.4% Akurasi Deteksi</strong><p>Diverifikasi oleh 50.000+ sampel bersertifikat</p></div></div>
          <div className="status-box"><small>STATUS</small><span><CircleDot size={12} className="blink" /> Analisis Mendalam Sedang Berlangsung...</span></div>
        </div>
      </div>

      <div className="center-head" style={{ marginTop: 64 }}>
        <h1 className="big">Apa Saja yang Dibutuhkan?</h1>
        <p className="lead">Hasil optimal memerlukan komponen inti ini untuk memastikan presisi AI.</p>
      </div>
      <div className="grid-4">
        {[
          [Camera, "Kamera Resolusi Tinggi", "Minimal 12MP direkomendasikan untuk menangkap tekstur permukaan yang halus dan gradasi warna."],
          [Wifi, "Koneksi Internet Stabil", "Diperlukan untuk sinkronisasi data real-time dan pemrosesan cloud yang berat."],
          [Sun, "Pencahayaan Cukup", "Cahaya alami atau lampu ruangan yang terang mencegah bayangan yang dapat mengganggu analisis kematangan."],
          [BrainCircuit, "Model AI Kami", "Akses ke inti kepemilikan FrescoAI untuk analitik buah paling akurat di dunia."],
        ].map(([Icon, t, d]) => (
          <div className="req" key={t}><span className="ico-blue"><Icon size={20} /></span><h4>{t}</h4><p>{d}</p></div>
        ))}
      </div>

      <div className="cta-dark">
        <h2>Siap untuk mulai memindai?</h2>
        <p>Bergabunglah dengan ribuan produsen dan konsumen yang sadar kualitas menggunakan FrescoAI setiap hari.</p>
        <div className="hero-cta center">
          <button className="btn btn-primary lg" onClick={() => go("deteksi")}>Buka Dashboard</button>
          <button className="btn btn-outline-light lg">Lihat Database</button>
        </div>
      </div>
    </main>
  );
}

/* ====================== PANDUAN ====================== */
function Panduan() {
  const fruits = [
    ["Apel", "apple", ["Kulit kencang dan halus", "Warna cerah dan seragam", "Berat terasa padat untuk ukurannya"], ["Tekstur lunak atau berpasir", "Memar atau bercak gelap", "Permukaan kulit berlubang"]],
    ["Pisang", "banana", ["Kulit kuning cerah", "Leher batang utuh", "Kencang saat disentuh"], ["Area lunak hitam besar", "Cairan keluar", "Jamur di dasar batang"]],
    ["Mangga", "mango", ["Sedikit empuk saat ditekan", "Aroma buah di pangkal batang", "Bentuk penuh dan berisi"], ["Kulit sangat berkerut", "Bau asam atau fermentasi", "Daging bagian dalam keabu-abuan"]],
    ["Jeruk", "orange", ["Berat untuk ukurannya", "Kulit kencang dan tipis", "Tidak ada bintik lunak yang terlihat"], ["Jamur putih atau biru", "Terasa kenyal atau kosong", "Ujung batang berubah warna"]],
  ];
  return (
    <main className="wrap">
      <div className="panduan-hero">
        <h1 className="big left">Ilmu Pengetahuan Kesegaran</h1>
        <p className="lead left">Memahami indikator visual kualitas buah membantu meminimalkan limbah dan memastikan nilai gizi puncak. Panduan berbasis AI kami mengidentifikasi penanda kematangan utama untuk hasil bumi favorit Anda.</p>
        <div className="badges"><span className="pill mint"><BadgeCheck size={13} /> Panduan Edukasi</span><span className="pill mint"><BrainCircuit size={13} /> Metrik Terlatih AI</span></div>
      </div>

      <div className="grid-4">
        {fruits.map(([name, kind, fresh, rot]) => (
          <div className="card fruit-card" key={name}>
            <Photo kind={kind} style={{ height: 200, borderRadius: "12px 12px 0 0" }} />
            <div className="fc-body">
              <div className="fc-title"><h3>{name}</h3><Leaf size={18} className="g-ico" /></div>
              <h5 className="ok"><CheckCircle2 size={15} /> Indikator Segar</h5>
              <ul>{fresh.map((x) => <li key={x}>{x}</li>)}</ul>
              <h5 className="bad"><AlertTriangle size={15} /> Tanda Pembusukan</h5>
              <ul className="bad-list">{rot.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-green">
        <div>
          <h2>Butuh analisis lebih mendalam?</h2>
          <p>Aplikasi seluler kami menggunakan simulasi analisis spektral melalui kamera Anda untuk mendeteksi pembusukan internal sebelum terlihat oleh mata manusia. Dapatkan grade kualitas yang presisi dalam hitungan detik.</p>
        </div>
        <div className="row-btns">
          <button className="btn btn-white">Unduh Aplikasi</button>
          <button className="btn btn-outline-light">Pelajari Lebih Lanjut</button>
        </div>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function today() { return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function guessKind(f = "") { f = f.toLowerCase(); if (f.includes("banana") || f.includes("pisang")) return "banana"; if (f.includes("orange") || f.includes("jeruk")) return "orange"; if (f.includes("mango") || f.includes("mangga")) return "mango"; return "apple"; }

const CSS = `
.root{
  --bg:#f4f6fa; --surface:#fff; --ink:#0d1b2a; --body:#4a5763; --muted:#7a8694;
  --line:#e7ebf1; --green:#15803d; --green-deep:#11652f; --green-bright:#1aa34a;
  --mint:#dcfce7; --mint-ink:#15803d; --blue:#eaf0fb; --red:#dc2626; --warn-soft:#fef0e8;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif; color:var(--body); background:var(--bg); min-height:100vh;
}
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.root *{box-sizing:border-box;margin:0;}
h1,h2,h3,h4,h5{color:var(--ink);font-weight:800;letter-spacing:-0.02em;line-height:1.15;}
a{cursor:pointer;}
.wrap{max-width:1180px;margin:0 auto;padding:0 40px;}
.g{color:var(--green);}

/* nav */
.nav{display:flex;align-items:center;gap:28px;padding:18px 40px;border-bottom:1px solid var(--line);background:rgba(244,246,250,.85);backdrop-filter:blur(8px);position:sticky;top:0;z-index:30;}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:21px;color:var(--green);}
.brand.sm{font-size:16px;}
.brand-mark{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--green);color:#fff;}
.nav-links{display:flex;gap:30px;margin-left:auto;}
.nav-links a{font-size:14px;font-weight:600;color:var(--body);}
.nav-links a.active{color:var(--green);border-bottom:2px solid var(--green);padding-bottom:3px;}
.nav-links a:hover{color:var(--green);}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;font-weight:700;font-size:14px;border:none;border-radius:999px;padding:11px 22px;cursor:pointer;transition:.16s;}
.btn.lg{padding:15px 28px;font-size:15px;}
.btn.sm{padding:8px 14px;font-size:13px;}
.btn.block{width:100%;margin-top:16px;}
.btn.tall{padding:15px;}
.btn-primary{background:var(--green);color:#fff;box-shadow:0 8px 20px -10px rgba(21,128,61,.7);}
.btn-primary:hover{background:var(--green-deep);}
.btn-outline{background:#fff;color:var(--green);border:1.5px solid var(--green);}
.btn-outline-light{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.5);}
.btn-white{background:#fff;color:var(--green);}
.link{color:var(--green);font-weight:700;font-size:13.5px;background:none;border:none;padding:0;cursor:pointer;}

/* shared */
.center-head{text-align:center;max-width:760px;margin:0 auto;}
.center-head .grid-3,.center-head .grid-4{text-align:left;}
.lead{color:var(--muted);font-size:16px;line-height:1.65;margin-top:14px;}
.big{font-size:46px;}
.eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;letter-spacing:.05em;color:var(--mint-ink);background:var(--mint);padding:7px 14px;border-radius:999px;}
.ico-mint{display:grid;place-items:center;width:48px;height:48px;border-radius:13px;background:var(--mint);color:var(--green);}
.ico-mint.round{width:64px;height:64px;border-radius:50%;}
.ico-mint.big-ico{width:64px;height:64px;border-radius:16px;margin:0 auto;}
.ico-blue{display:grid;place-items:center;width:48px;height:48px;border-radius:13px;background:var(--blue);color:var(--green);}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:6px 13px;border-radius:999px;}
.pill.mint{background:var(--mint);color:var(--mint-ink);}
.pill.amber{background:#fdebd0;color:#9a5b16;}
.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:0 1px 2px rgba(13,27,42,.03),0 18px 40px -28px rgba(13,27,42,.22);}
.pad{padding:24px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:36px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:36px;}
.row-btns{display:flex;gap:12px;}

/* photo placeholder */
.photo{position:relative;display:grid;place-items:center;overflow:hidden;}
.photo-emoji{font-size:46px;opacity:.55;filter:saturate(.85);}

/* hero */
.hero{display:grid;grid-template-columns:1fr 1.05fr;gap:60px;align-items:center;padding-top:70px;padding-bottom:40px;}
.hero h1{font-size:52px;margin:18px 0 18px;}
.hero-copy p{font-size:16px;line-height:1.65;color:var(--muted);}
.hero-cta{display:flex;gap:14px;margin-top:30px;}
.hero-cta.center{justify-content:center;}
.scan-h{position:absolute;left:0;right:0;top:35%;height:2px;background:var(--green-bright);box-shadow:0 0 12px 1px rgba(26,163,74,.6);}
.hero-result{position:absolute;left:24px;right:24px;bottom:24px;display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.95);border-radius:14px;padding:14px 18px;backdrop-filter:blur(6px);}
.hr-check{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--mint);color:var(--green);flex:none;}
.hr-mid{flex:1;}.hr-mid small,.hr-right small{display:block;font-size:11px;color:var(--muted);}
.hr-mid strong{font-size:17px;color:var(--ink);}.hr-right{text-align:right;}.hr-right strong{font-size:15px;color:var(--ink);}

/* band */
.band{background:#eef1f8;margin-top:30px;padding:80px 0;}
.feature{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px;box-shadow:0 18px 40px -30px rgba(13,27,42,.25);}
.feature h3{font-size:20px;margin:18px 0 10px;}
.feature p{font-size:14px;line-height:1.6;color:var(--muted);}

/* steps asym */
.steps-asym{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;padding:90px 40px;}
.collage{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;grid-template-areas:"a b" "c b";gap:16px;}
.steps-list h2{font-size:30px;margin-bottom:28px;}
.step-row{display:flex;gap:18px;margin-bottom:22px;}
.step-num{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--green);color:#fff;font-weight:800;flex:none;}
.step-row h4{font-size:18px;margin-bottom:6px;}
.step-row p{font-size:14px;line-height:1.6;color:var(--muted);}

/* soft cta */
.cta-soft{background:#e4eaf8;border-radius:24px;text-align:center;padding:64px 40px;margin:30px 0 80px;}
.cta-soft small{color:var(--green);font-weight:700;font-size:14px;}
.cta-soft p{max-width:560px;margin:16px auto 28px;color:var(--body);font-size:16px;}

/* deteksi */
.deteksi{padding-top:60px;}
.mode-tabs{display:flex;gap:8px;margin-top:32px;background:#eef1f8;border-radius:14px;padding:6px;width:fit-content;}
.mode-tab{display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-weight:700;font-size:14px;border:none;border-radius:10px;padding:10px 20px;cursor:pointer;background:transparent;color:var(--body);transition:.15s;}
.mode-tab.active{background:#fff;color:var(--green);box-shadow:0 1px 4px rgba(13,27,42,.1);}
.mode-tab:hover:not(.active){color:var(--green);}
.det-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:24px;align-items:start;margin-top:20px;}
.live-wrap{position:relative;border-radius:14px;overflow:hidden;background:#0d1b2a;min-height:300px;display:flex;align-items:center;justify-content:center;}
.live-video{width:100%;height:300px;object-fit:cover;display:block;}
.live-video.hidden{display:none;}
.live-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;gap:12px;color:#fff;}
.live-placeholder h3{color:#fff;font-size:20px;}
.live-placeholder p{color:rgba(255,255,255,.6);font-size:14px;}
.live-placeholder .ico-mint{background:rgba(255,255,255,.1);color:#fff;}
.live-badge{position:absolute;top:12px;left:12px;display:flex;align-items:center;gap:6px;background:rgba(220,38,38,.9);color:#fff;font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;letter-spacing:.05em;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#fff;animation:blink 1s infinite;}
.live-info{font-size:12.5px;color:var(--muted);margin-top:10px;text-align:center;}
.det-right{display:flex;flex-direction:column;gap:24px;}
.dropzone{position:relative;border:2px dashed #c9e3d0;border-radius:14px;background:#f2faf4;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;cursor:pointer;overflow:hidden;}
.dropzone.drag{border-color:var(--green);background:var(--mint);}
.dropzone.has{padding:0;border-style:solid;border-color:var(--line);}
.dropzone h3{font-size:22px;margin:18px 0 8px;}
.dropzone p{font-size:14px;color:var(--muted);margin-bottom:20px;}
.preview{width:100%;height:300px;object-fit:cover;}
.reset{position:absolute;top:12px;right:12px;}
.scanline{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--green-bright),transparent);box-shadow:0 0 14px 2px rgba(26,163,74,.6);animation:scan 1.5s linear infinite;}
@keyframes scan{0%{top:0}100%{top:100%}}
.progress{margin-top:22px;}
.progress-top{display:flex;justify-content:space-between;font-size:14px;color:var(--body);margin-bottom:8px;}
.progress-top strong{color:var(--green);}
.bar{height:8px;background:#e7ebf1;border-radius:999px;overflow:hidden;}
.bar-fill{height:100%;background:var(--green);border-radius:999px;transition:width .25s;}
.slow-warn{font-size:12.5px;color:#9a5b16;margin-top:8px;text-align:center;}
.error-box{margin-top:16px;background:var(--warn-soft);color:#9a4a16;border-radius:12px;padding:14px;font-size:13.5px;line-height:1.5;}
.error-box .link{display:block;margin-top:8px;}
.demo{display:block;margin:16px auto 0;}
.score-head{display:flex;justify-content:space-between;align-items:flex-start;}
.score-title{font-size:28px;margin-top:10px;}
.score-num{text-align:right;}
.score-num strong{font-size:34px;font-weight:800;color:var(--green);display:block;line-height:1;}
.score-num strong.red,.hist-score.red{color:var(--red);}
.score-num small{font-size:10.5px;letter-spacing:.05em;color:var(--muted);font-weight:700;}
.result-img-wrap{position:relative;border-radius:16px;overflow:hidden;height:230px;}
.result-img{width:100%;height:100%;object-fit:cover;display:block;}
.result-img-wrap .visual-tags{position:absolute;left:14px;bottom:14px;display:flex;gap:8px;}
.visual-tags{position:absolute;left:14px;bottom:14px;display:flex;gap:8px;}
.vt-dark{background:rgba(13,27,42,.7);color:#fff;font-size:12px;font-weight:600;padding:5px 11px;border-radius:8px;}
.vt-light{background:rgba(255,255,255,.92);color:var(--ink);font-size:12px;font-weight:600;padding:5px 11px;border-radius:8px;}
.metrics{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.metric{background:#f6f8fb;border:1px solid var(--line);border-radius:12px;padding:14px;}
.metric small{font-size:12.5px;color:var(--muted);}
.mv{display:flex;align-items:center;gap:6px;margin-top:6px;font-weight:700;color:var(--ink);}
.mv svg{color:var(--green);}
.wawasan{display:flex;align-items:center;gap:8px;font-size:20px;color:var(--green-deep);}
.advice{font-size:14px;line-height:1.65;color:var(--muted);margin:14px 0 18px;}
.estimate-note{font-size:11.5px;line-height:1.5;color:var(--muted);margin-top:14px;opacity:.85;}
.riwayat{margin:64px 0 80px;}
.center-only{text-align:center;font-size:30px;}
.hist{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;}
.hist-body{flex:1;min-width:0;}
.hist-body small{font-size:11.5px;color:var(--muted);}
.hist-body strong{display:block;font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hist-score{font-size:18px;font-weight:800;}
.hist-score.green{color:var(--green);}

/* cara kerja */
.numbered{margin-top:50px;}
.num-step{text-align:center;}
.num-ico{position:relative;width:64px;margin:0 auto 18px;}
.num-badge{position:absolute;top:-6px;right:-6px;width:26px;height:26px;border-radius:50%;background:var(--green-deep);color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center;}
.num-step h3{font-size:22px;margin-bottom:10px;}
.num-step p{font-size:14px;line-height:1.6;color:var(--muted);}
.viz{display:flex;gap:48px;align-items:center;background:#e4eaf8;border-radius:20px;padding:48px;margin-top:56px;}
.viz-body{flex:1;}
.viz-body h2{font-size:30px;margin-bottom:24px;}
.viz-acc{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
.ring{width:44px;height:44px;border-radius:50%;border:4px solid #cfe0d4;border-top-color:var(--green);flex:none;animation:spin 1.6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.viz-acc strong{color:var(--green);font-size:15px;}.viz-acc p{font-size:13.5px;color:var(--body);}
.status-box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;}
.status-box small{font-size:11px;letter-spacing:.06em;color:var(--muted);font-weight:700;}
.status-box span{display:flex;align-items:center;gap:8px;margin-top:8px;font-weight:700;color:var(--ink);}
.status-box .blink{color:var(--green-bright);animation:blink 1.2s infinite;}
@keyframes blink{50%{opacity:.3}}
.req{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;box-shadow:0 18px 40px -30px rgba(13,27,42,.25);}
.req h4{font-size:17px;margin:18px 0 10px;}
.req p{font-size:13.5px;line-height:1.6;color:var(--muted);}
.cta-dark{margin:64px 0 80px;border-radius:24px;padding:72px 40px;text-align:center;color:#fff;background:linear-gradient(135deg,#123528,#0c2230 60%,#0e2a3a);}
.cta-dark h2{color:#fff;font-size:38px;}
.cta-dark p{max-width:560px;margin:18px auto 30px;color:rgba(255,255,255,.8);font-size:16px;}

/* panduan */
.panduan-hero{padding-top:60px;max-width:760px;}
.big.left{text-align:left;font-size:46px;}
.lead.left{text-align:left;}
.badges{display:flex;gap:12px;margin-top:24px;}
.fruit-card{overflow:hidden;display:flex;flex-direction:column;}
.fc-body{padding:22px;}
.fc-title{display:flex;justify-content:space-between;align-items:center;}
.fc-title h3{font-size:22px;}.g-ico{color:var(--green);}
.fc-body h5{font-size:13.5px;margin:18px 0 10px;display:flex;align-items:center;gap:6px;font-weight:700;}
.fc-body h5.ok{color:var(--green);}
.fc-body h5.bad{color:var(--red);}
.fc-body ul{list-style:none;display:flex;flex-direction:column;gap:7px;}
.fc-body li{font-size:13.5px;color:var(--body);padding-left:14px;position:relative;line-height:1.45;}
.fc-body li:before{content:"•";position:absolute;left:0;color:var(--muted);}
.cta-green{margin:64px 0 80px;border-radius:24px;padding:56px;background:var(--green-deep);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:40px;}
.cta-green h2{color:#fff;font-size:30px;margin-bottom:16px;}
.cta-green p{color:rgba(255,255,255,.82);font-size:15px;line-height:1.6;max-width:560px;}

/* footer */
.footer{border-top:1px solid var(--line);background:var(--bg);padding:36px 0;}
.foot-inner{max-width:1180px;margin:0 auto;padding:0 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:30px;flex-wrap:wrap;}
.foot-copy{font-size:13px;color:var(--muted);margin-top:8px;}
.foot-links{display:flex;gap:26px;flex-wrap:wrap;}
.foot-links a{font-size:13.5px;color:var(--body);}
.foot-social{display:flex;gap:10px;}
.foot-social span{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#fff;border:1px solid var(--line);color:var(--muted);}

@media(max-width:920px){
  .hero,.steps-asym,.det-grid,.viz,.cta-green{grid-template-columns:1fr;flex-direction:column;display:grid;}
  .grid-3,.grid-4{grid-template-columns:1fr 1fr;}
  .nav-links{display:none;}
  .big,.hero h1{font-size:34px;}
  .viz .photo{width:100%!important;}
  .wrap{padding:0 20px;}
}
@media(max-width:560px){.grid-3,.grid-4{grid-template-columns:1fr;}}
`;
