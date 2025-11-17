import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, ImageDown, Layers, RefreshCw, Sparkles, Upload, History as HistoryIcon } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function ColorInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-24 text-gray-500">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 rounded border border-gray-200"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-10 rounded border border-gray-200 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  )
}

function NumberInput({ label, value, onChange, min, max }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-24 text-gray-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e)=> onChange(parseInt(e.target.value))}
        className="flex-1"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e)=> onChange(parseInt(e.target.value))}
        className="w-20 h-10 rounded border border-gray-200 px-2"
      />
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

function History({ items, onPick }) {
  if (!items?.length) return null
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 mb-2"><HistoryIcon size={14}/> Recent</div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {items.map((h, idx) => (
          <button key={idx} onClick={() => onPick(h)} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow">
            <img src={`${API}/api/qrcode.png`} alt="qr" className="hidden"/>
            <div className="absolute inset-0 grid place-items-center">
              <img src={`${API}/api/qrcode.png`} className="opacity-0" alt=""/>
              <QRPreview tiny {...h} />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition"/>
          </button>
        ))}
      </div>
    </div>
  )
}

function QRPreview({ content, fill_color, back_color, box_size, border, error_correction, logo_url, tiny }) {
  const [src, setSrc] = useState('')
  const body = useMemo(() => ({ content, fill_color, back_color, box_size, border, error_correction, logo_url, rounded: true }), [content, fill_color, back_color, box_size, border, error_correction, logo_url])
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API}/api/qrcode.png`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const blob = await res.blob()
        setSrc(URL.createObjectURL(blob))
      } catch {}
    }
    if (content) run()
  }, [JSON.stringify(body)])

  if (!src) return <div className={`aspect-square ${tiny ? 'w-full' : 'w-72'} rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse`} />
  return <img src={src} alt="qr" className={`aspect-square ${tiny ? 'w-full' : 'w-72'} rounded-2xl shadow-lg border border-white/70`} />
}

function App() {
  const [content, setContent] = useState('https://example.com')
  const [fill, setFill] = useState('#111827')
  const [back, setBack] = useState('#ffffff')
  const [box, setBox] = useState(10)
  const [border, setBorder] = useState(4)
  const [ec, setEc] = useState('M')
  const [rounded, setRounded] = useState(true)
  const [logoUrl, setLogoUrl] = useState('')
  const [history, setHistory] = useState([])

  const body = { content, fill_color: fill, back_color: back, box_size: box, border, error_correction: ec, rounded, logo_url: logoUrl || null }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/history`)
        const data = await res.json()
        setHistory(data)
      } catch {}
    }
    load()
  }, [])

  const downloadRef = useRef(null)

  const download = async () => {
    const res = await fetch(`${API}/api/qrcode.png`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-code.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setContent('')
    setFill('#111827')
    setBack('#ffffff')
    setBox(10)
    setBorder(4)
    setEc('M')
    setRounded(true)
    setLogoUrl('')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_80%_-10%,rgba(99,102,241,0.15),transparent),radial-gradient(800px_500px_at_20%_10%,rgba(236,72,153,0.12),transparent)] from-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Modern QR Generator</h1>
            <p className="text-gray-500 mt-1">Create beautiful, scannable codes with custom colors, rounded modules, and logos.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RefreshCw size={16}/> Reset</button>
            <button onClick={download} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500"><Download size={16}/> Download PNG</button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white/80 backdrop-blur border border-white shadow-sm rounded-2xl p-6">
            <div className="space-y-5">
              <label className="block text-sm">
                <span className="text-gray-500">Content</span>
                <input
                  type="text"
                  value={content}
                  onChange={(e)=> setContent(e.target.value)}
                  placeholder="Paste URL or type text"
                  className="mt-1 w-full h-11 rounded-lg border border-gray-200 px-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorInput label="Fill color" value={fill} onChange={setFill} />
                <ColorInput label="Background" value={back} onChange={setBack} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput label="Box size" value={box} onChange={setBox} min={4} max={20} />
                <NumberInput label="Border" value={border} onChange={setBorder} min={0} max={10} />
              </div>

              <label className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-500">Error level</span>
                <select value={ec} onChange={(e)=> setEc(e.target.value)} className="h-10 flex-1 rounded border border-gray-200 px-3">
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </label>

              <Toggle label="Rounded modules" checked={rounded} onChange={setRounded} />

              <label className="block text-sm">
                <span className="text-gray-500">Center logo URL</span>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e)=> setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1 w-full h-11 rounded-lg border border-gray-200 px-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative grid place-items-center">
              <div className="absolute -inset-6 -z-10 bg-gradient-to-br from-indigo-200/40 to-fuchsia-200/40 blur-2xl rounded-3xl" />
              <QRPreview {...{ content, fill_color: fill, back_color: back, box_size: box, border, error_correction: ec, logo_url: logoUrl || null }} />
            </div>

            <History items={history} onPick={(h)=>{
              setContent(h.content)
              setFill(h.fill_color)
              setBack(h.back_color)
              setBox(h.box_size)
              setBorder(h.border)
              setEc(h.error_correction)
              setLogoUrl(h.logo_url || '')
            }} />
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-gray-400">Built with love • Scannable and stylish</footer>
      </div>
    </div>
  )
}

export default App
