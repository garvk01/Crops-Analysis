// import { useEffect, useRef, useState } from 'react'
// import styles from './LocationPicker.module.css'

// const PRESET_LOCATIONS = [
//   { label: 'Punjab, India',      lat: 30.90, lng: 75.85 },
//   { label: 'Kerala, India',      lat: 10.85, lng: 76.27 },
//   { label: 'Maharashtra, India', lat: 19.60, lng: 74.32 },
//   { label: 'Haryana, India',     lat: 29.06, lng: 76.09 },
//   { label: 'UP, India',          lat: 26.84, lng: 80.94 },
//   { label: 'Madhya Pradesh',     lat: 22.97, lng: 78.66 },
// ]

// /**
//  * LocationPicker
//  * Small Leaflet map that lets the user click to drop a pin.
//  * Falls back to preset dropdown if Leaflet fails to load.
//  */
// export default function LocationPicker({ value, onChange }) {
//   const mapRef    = useRef(null)
//   const leafletRef = useRef(null)
//   const markerRef  = useRef(null)
//   const [leafletReady, setLeafletReady] = useState(false)
//   const [error, setError]              = useState(false)

//   const current = value || { lat: 30.90, lng: 75.85, label: 'Punjab, India' }

//   useEffect(() => {
//     const load = async () => {
//       if (!mapRef.current || leafletRef.current) return
//       try {
//         if (!document.getElementById('leaflet-css')) {
//           const link = document.createElement('link')
//           link.id   = 'leaflet-css'
//           link.rel  = 'stylesheet'
//           link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
//           document.head.appendChild(link)
//         }
//         if (!window.L) {
//           await new Promise((res, rej) => {
//             const s  = document.createElement('script')
//             s.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
//             s.onload  = res
//             s.onerror = rej
//             document.head.appendChild(s)
//           })
//         }
//         const L = window.L

//         const map = L.map(mapRef.current, {
//           center: [current.lat, current.lng],
//           zoom: 9,
//           scrollWheelZoom: true
//         })

//         L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
//           attribution: '© Stadia Maps', maxZoom: 18
//         }).addTo(map)

//         const icon = L.divIcon({
//           className: '',
//           html: `<div style="width:12px;height:12px;background:#3d6b45;border:2px solid #8fb07a;border-radius:50%;box-shadow:0 0 0 4px rgba(61,107,69,.2)"></div>`,
//           iconSize: [12, 12], iconAnchor: [6, 6]
//         })

//         const marker = L.marker([current.lat, current.lng], { icon, draggable: true }).addTo(map)
//         markerRef.current = marker

//         const updateLocation = (latlng) => {
//           onChange({ lat: +latlng.lat.toFixed(5), lng: +latlng.lng.toFixed(5), label: current.label })
//         }

//         marker.on('dragend', e => updateLocation(e.target.getLatLng()))
//         map.on('click', e => {
//           marker.setLatLng(e.latlng)
//           updateLocation(e.latlng)
//         })

//         leafletRef.current = map
//         setLeafletReady(true)
//       } catch (e) {
//         console.warn('[LocationPicker] Failed to load Leaflet:', e)
//         setError(true)
//       }
//     }
//     load()
//     return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null } }
//   }, [])

//   const handlePreset = (e) => {
//     const preset = PRESET_LOCATIONS.find(p => p.label === e.target.value)
//     if (!preset) return
//     onChange(preset)
//     if (leafletRef.current && markerRef.current) {
//       leafletRef.current.setView([preset.lat, preset.lng], 9)
//       markerRef.current.setLatLng([preset.lat, preset.lng])
//     }
//   }

//   return (
//     <div className={styles.wrap}>
//       <div className={styles.presetRow}>
//         <select className={styles.select} value={current.label} onChange={handlePreset}>
//           <option value="">— Select preset location —</option>
//           {PRESET_LOCATIONS.map(p => (
//             <option key={p.label} value={p.label}>{p.label}</option>
//           ))}
//         </select>
//         {value?.lat && (
//           <span className={styles.coords}>{value.lat.toFixed(3)}, {value.lng.toFixed(3)}</span>
//         )}
//       </div>
//       <div className={styles.mapWrap} ref={mapRef} />
//       {error && (
//         <div className={styles.fallback}>Map unavailable — use preset dropdown above</div>
//       )}
//       <div className={styles.hint}>Click the map or drag the pin to set farm location</div>
//     </div>
//   )
// }
// ----------------------------------------------------------------------------------------------------------------------------
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './LocationPicker.module.css'

// 🔥 Fix marker icons (required)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const PRESET_LOCATIONS = [
  { label: 'Punjab, India', lat: 30.9, lng: 75.85 },
  { label: 'Kerala, India', lat: 10.85, lng: 76.27 },
  { label: 'Maharashtra, India', lat: 19.6, lng: 74.32 },
]

export default function LocationPicker({ value = {}, onChange }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

  // 🔥 SAFE fallback (prevents crash)
  const current = {
    lat: value?.lat || 30.9,
    lng: value?.lng || 75.85,
    label: value?.label || 'Punjab, India',
  }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    try {
      mapRef.current.style.height = "220px"

      const map = L.map(mapRef.current).setView(
        [current.lat, current.lng],
        6
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const marker = L.marker([current.lat, current.lng], {
        draggable: true,
      }).addTo(map)

      markerRef.current = marker

      const updateLocation = (latlng) => {
        if (!onChange) return  // 🔥 prevent crash

        onChange({
          lat: +latlng.lat.toFixed(5),
          lng: +latlng.lng.toFixed(5),
          label: current.label,
        })
      }

      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        updateLocation(e.latlng)
      })

      marker.on('dragend', (e) => {
        updateLocation(e.target.getLatLng())
      })

      mapInstance.current = map

    } catch (err) {
      console.error("MAP ERROR:", err)
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const handlePresetChange = (e) => {
    const selected = PRESET_LOCATIONS.find(p => p.label === e.target.value)
    if (!selected) return

    if (onChange) onChange(selected)

    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setView([selected.lat, selected.lng], 6)
      markerRef.current.setLatLng([selected.lat, selected.lng])
    }
  }

  return (
    <div className={styles.wrap}>

      <select
        className={styles.select}
        value={current.label}
        onChange={handlePresetChange}
      >
        <option value="">— Select preset location —</option>
        {PRESET_LOCATIONS.map(p => (
          <option key={p.label} value={p.label}>{p.label}</option>
        ))}
      </select>

      <div ref={mapRef} className={styles.mapWrap}></div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={value?.lat || ''}
          placeholder="Latitude"
          readOnly
        />
        <input
          className={styles.input}
          value={value?.lng || ''}
          placeholder="Longitude"
          readOnly
        />
      </div>

      <div className={styles.hint}>
        Click the map or drag the pin to set farm location
      </div>

    </div>
  )
}