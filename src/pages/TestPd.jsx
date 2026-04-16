import { useState, useRef, useEffect } from 'react'
import { Browser as WebPdRuntime } from 'webpd'

function PianoKey({ pressed, onPress, onRelease }) {
  return (
    <div
      style={{ position: 'relative', width: '70px', height: '200px', cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={(e) => { e.preventDefault(); onPress() }}
      onTouchEnd={onRelease}
    >
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#bbb',
        borderRadius: '0 0 6px 6px',
        boxShadow: '0 4px 0 #888',
      }} />
      <div style={{
        position: 'absolute',
        top: pressed ? '8px' : '0px',
        width: '100%',
        height: 'calc(100% - 4px)',
        backgroundColor: pressed ? '#e8e8e8' : '#fff',
        borderRadius: '0 0 5px 5px',
        border: '1px solid #ccc',
        borderTop: 'none',
        boxShadow: pressed ? '0 2px 0 #aaa' : '0 6px 0 #aaa',
        transition: 'top 0.04s ease, box-shadow 0.04s ease',
      }} />
    </div>
  )
}

function TestPd() {
  const [status, setStatus] = useState('Initializing...')
  const [pressed, setPressed] = useState(false)
  const [freq, setFreq] = useState(440)
  const audioCtxRef = useRef(null)
  const pdNodeRef = useRef(null)

  useEffect(() => {
    const initPd = async () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = audioCtx
        await WebPdRuntime.initialize(audioCtx)
        const response = await fetch('/patch.wasm')
        audioCtxRef.current._patch = await response.arrayBuffer()
        setStatus('Click the key to start!')
      } catch (err) {
        setStatus(`Error: ${err.message}`)
        console.error(err)
      }
    }
    initPd()
  }, [])

  const ensureStarted = async () => {
    const audioCtx = audioCtxRef.current
    if (pdNodeRef.current) return
    if (audioCtx.state === 'suspended') await audioCtx.resume()
    const node = await WebPdRuntime.run(
      audioCtx,
      audioCtx._patch,
      WebPdRuntime.defaultSettingsForRun('/patch.wasm'),
    )
    node.connect(audioCtx.destination)
    pdNodeRef.current = node
    setStatus('Running!')
  }

  const sendFreq = (value) => {
    pdNodeRef.current.port.postMessage({
      type: 'io:messageReceiver',
      payload: { nodeId: 'n_0_0', portletId: '0', message: [value] },
    })
  }

  const handlePress = async () => {
    await ensureStarted()
    sendFreq(freq)
    setPressed(true)
  }

  const handleRelease = () => {
    if (!pressed) return
    sendFreq(0)
    setPressed(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>WebPd Test</h1>
      <p>Status: <strong>{status}</strong></p>

      <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label>
          Frequency (Hz):
          <input
            type="number"
            min="20"
            max="20000"
            value={freq}
            onChange={e => setFreq(parseFloat(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '90px', fontSize: '1rem', padding: '0.25rem' }}
          />
        </label>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <PianoKey pressed={pressed} onPress={handlePress} onRelease={handleRelease} />
      </div>
    </div>
  )
}

export default TestPd