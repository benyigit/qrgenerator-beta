import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link as LinkIcon, RefreshCw, QrCode, Layers, Palette, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [url, setUrl] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ff00000');
  const [size, setSize] = useState(256);
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const qrRef = useRef();

  useEffect(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (link) => {
    if (!link) return;
    const newHistory = [
      { id: Date.now(), url: link, date: new Date().toLocaleTimeString('tr-TR') },
      ...history.slice(0, 4)
    ];
    setHistory(newHistory);
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  };

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${Date.now()}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!url) return;
    setIsGenerating(true);
    setTimeout(() => {
      saveToHistory(url);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="container">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header"
      >
        <div className="logo-box acid-border">
          <Terminal className="logo-icon flicker-animation" size={32} color="var(--ac-accent)" />
          <h1 className="gradient-text">SYS.QR_GEN</h1>
          <span className="beta-badge acid-border">v1.0</span>
        </div>
        <div className="terminal-bar acid-border">
          <span className="status-dot"></span>
          <p className="subtitle">TERMINAL WAITING FOR INPUT...</p>
        </div>
      </motion.header>

      <main className="main-content">
        <div className="grid-layout">
          {/* Controls Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="acid-card controls-panel"
          >
            <div className="panel-header">
              <h2>[ INPUT_DATA ]</h2>
            </div>

            <form onSubmit={handleGenerate} className="input-group">
              <label><LinkIcon size={16} /> DATA_PAYLOAD</label>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="acid-input"
                />
                <button type="submit" disabled={!url} className="generate-btn acid-button">
                  {isGenerating ? <RefreshCw className="spin" size={20} /> : 'COMPILE'}
                </button>
              </div>
            </form>

            <div className="settings-grid">
              <div className="setting-item acid-border">
                <label><Palette size={16} /> FG_HEX</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                  <span>{fgColor}</span>
                </div>
              </div>
              <div className="setting-item acid-border">
                <label><Layers size={16} /> BG_HEX</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <span>{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="history-section acid-border">
              <div className="panel-header" style={{ border: 'none', borderBottom: '1px solid var(--ac-border-bright)', marginBottom: '0' }}>
                <h3>[ CACHE_DATA ]</h3>
              </div>
              <div className="history-list">
                {history.length === 0 ? (
                  <p className="empty-text">NO DATA IN CACHE.</p>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="history-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setUrl(item.url)}
                    >
                      <span className="history-url">{item.url}</span>
                      <span className="history-date">[{item.date}]</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.section>

          {/* Preview Section */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="acid-card preview-panel"
          >
            <div className="panel-header">
              <h2>[ OUTPUT_VIEW ]</h2>
            </div>

            <div className="qr-container" ref={qrRef}>
              <AnimatePresence mode="wait">
                {url ? (
                  <motion.div
                    key={url + fgColor + bgColor}
                    initial={{ scale: 0.9, filter: "brightness(0)" }}
                    animate={{ scale: 1, filter: "brightness(1)", transition: { duration: 0.2 } }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="qr-wrapper acid-border"
                    style={{ backgroundColor: bgColor, padding: '16px' }}
                  >
                    <QRCodeSVG
                      value={url}
                      size={size}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      includeMargin={false}
                      level="H"
                    />
                  </motion.div>
                ) : (
                  <div className="qr-placeholder acid-border">
                    <QrCode size={80} color="var(--ac-border-muted)" />
                    <p>AWAITING_PAYLOAD</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {url && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="download-btn acid-button"
                onClick={downloadQR}
              >
                <Download size={20} /> EXTRACT_PNG
              </motion.button>
            )}
          </motion.section>
        </div>
      </main>

      <footer className="footer acid-border">
        <p>ACID_UI // SYSTEM.RUN() // STATUS: ONLINE</p>
      </footer>

      <style jsx="true">{`
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .acid-border {
          border: 1px solid var(--ac-border-bright);
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--ac-surface);
          width: fit-content;
        }

        .terminal-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #000;
          color: var(--ac-accent);
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--ac-accent);
          border-radius: 50%;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .beta-badge {
          font-size: 0.75rem;
          background: var(--ac-accent);
          color: #000;
          padding: 0.2rem 0.5rem;
          font-weight: bold;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
        }

        .acid-card {
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          background: var(--ac-border-bright);
          color: var(--ac-text-primary);
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border-bottom: 2px solid var(--ac-accent);
        }

        .panel-header h2, .panel-header h3 {
          font-size: 1rem;
          margin: 0;
          letter-spacing: 1px;
        }

        .controls-panel {
          padding-bottom: 2rem;
        }

        .controls-panel > *:not(.panel-header) {
          margin: 0 1.5rem;
        }
        
        .input-group {
          margin-top: 2rem !important;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--ac-text-secondary);
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        .search-box {
          display: flex;
          gap: 0.5rem;
        }

        .acid-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #000;
        }

        .acid-button {
          padding: 0.75rem 1.5rem;
        }

        .acid-button:hover:not(:disabled) {
          background: var(--ac-accent);
          color: #000;
        }

        .acid-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #000;
          color: var(--ac-text-secondary);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1.5rem !important;
        }

        .setting-item {
          padding: 0.75rem;
          background: #000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--ac-text-secondary);
        }

        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .color-picker-wrapper span {
          font-size: 0.85rem;
          color: var(--ac-text-primary);
        }

        input[type="color"] {
          width: 32px;
          height: 32px;
          border: 1px solid var(--ac-border-bright);
          background: none;
          cursor: pointer;
          padding: 0;
        }
        
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        
        input[type="color"]::-webkit-color-swatch {
          border: none;
        }

        .history-section {
          margin-top: 2rem !important;
          background: #000;
        }

        .history-list {
          display: flex;
          flex-direction: column;
        }

        .empty-text {
          color: var(--ac-text-secondary);
          font-size: 0.85rem;
          padding: 1rem;
          text-align: center;
        }

        .history-item {
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid var(--ac-border-muted);
          transition: all 0.2s;
        }

        .history-item:hover {
          background: var(--ac-border-bright);
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .history-url {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.85rem;
          color: var(--ac-accent);
        }

        .history-date {
          font-size: 0.75rem;
          color: var(--ac-text-secondary);
        }

        .preview-panel {
          gap: 2rem;
          padding-bottom: 2rem;
        }
        .preview-panel > *:not(.panel-header) {
          margin: 0 1.5rem;
        }

        .qr-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          margin-top: 2rem !important;
        }

        .qr-placeholder {
          width: 256px;
          height: 256px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: #000;
          color: var(--ac-border-muted);
          font-size: 0.8rem;
          letter-spacing: 1px;
        }

        .qr-wrapper {
          box-shadow: 10px 10px 0px var(--ac-accent);
          transition: transform 0.2s;
        }
        .qr-wrapper:hover {
          transform: translate(-5px, -5px);
          box-shadow: 15px 15px 0px var(--ac-accent);
        }

        .download-btn {
          width: calc(100% - 3rem);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          font-size: 1rem;
        }

        .footer {
          text-align: center;
          padding: 1rem;
          background: #000;
          color: var(--ac-text-secondary);
          font-size: 0.75rem;
          letter-spacing: 2px;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 968px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
          
          .acid-card {
            margin-bottom: 1rem;
          }
            .logo-box {
              width: 100%;
            padding: 0.75rem 1rem;
            justify-content: center;
            gap: 0.5rem;
            }
            .logo-box h1 {
            font-size: 1.5rem; !important;
            text-alighn: center;
          
            }
            .beta-badge{
            font-size: 0.65rem;
            padding: 0.15.rem 0.4rem;}
        }
      `}</style>
    </div>
  );
};

export default App;
