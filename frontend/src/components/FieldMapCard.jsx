// import { useEffect, useRef } from 'react'
// import styles from './FieldMapCard.module.css'

// /**
//  * FieldMapCard — Leaflet-based interactive map
//  * Dynamically loads Leaflet from CDN to avoid bundler issues.
//  * Falls back to a static coordinate display if Leaflet fails.
//  */
// export default function FieldMapCard({ lat, lng, label, zoom = 11, height = 280 }) {
//   const mapRef    = useRef(null)
//   const leafletRef = useRef(null)

//   const validLat = lat ?? 30.9
//   const validLng = lng ?? 75.8
//   const hasCoords = lat != null && lng != null

//   useEffect(() => {
//     if (!mapRef.current || leafletRef.current) return

//     // Dynamically load Leaflet CSS + JS from CDN
//     const loadLeaflet = async () => {
//       // Inject CSS
//       if (!document.getElementById('leaflet-css')) {
//         const link = document.createElement('link')
//         link.id   = 'leaflet-css'
//         link.rel  = 'stylesheet'
//         link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
//         document.head.appendChild(link)
//       }

//       // Inject JS
//       if (!window.L) {
//         await new Promise((resolve, reject) => {
//           const script  = document.createElement('script')
//           script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
//           script.onload  = resolve
//           script.onerror = reject
//           document.head.appendChild(script)
//         })
//       }

//       const L = window.L
//       // Init map
//       const map = L.map(mapRef.current, {
//         center:       [validLat, validLng],
//         zoom,
//         zoomControl:  true,
//         scrollWheelZoom: false
//       })

//       // Dark-style tile layer (Stadia Alidade)
//       L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
//         attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
//         maxZoom: 18
//       }).addTo(map)

//       // Custom green marker
//       const icon = L.divIcon({
//         className: '',
//         html: `<div style="
//           width:14px;height:14px;background:#3d6b45;border:2.5px solid #8fb07a;
//           border-radius:50%;box-shadow:0 0 0 4px rgba(61,107,69,0.25)">
//         </div>`,
//         iconSize:   [14, 14],
//         iconAnchor: [7, 7]
//       })

//       L.marker([validLat, validLng], { icon })
//         .addTo(map)
//         .bindPopup(`<strong>${label || 'Farm location'}</strong><br/>${validLat.toFixed(4)}, ${validLng.toFixed(4)}`)

//       leafletRef.current = map
//     }

//     loadLeaflet().catch(err => console.warn('[FieldMapCard] Leaflet load failed:', err))

//     return () => {
//       if (leafletRef.current) {
//         leafletRef.current.remove()
//         leafletRef.current = null
//       }
//     }
//   }, [validLat, validLng])

//   return (
//     <div className={styles.wrap}>
//       <div className={styles.mapContainer} style={{ height }} ref={mapRef} />
//       <div className={styles.coordBar}>
//         <span className={styles.coordIcon}>📍</span>
//         <span className={styles.coordLabel}>{label || 'Farm location'}</span>
//         {hasCoords && (
//           <span className={styles.coordValues}>
//             {validLat.toFixed(4)}°N, {validLng.toFixed(4)}°E
//           </span>
//         )}
//         {!hasCoords && (
//           <span className={styles.coordMissing}>No coordinates set</span>
//         )}
//       </div>
//     </div>
//   )
// }
// ------------------------------------------------------------------------------------------------
import { useEffect, useRef, useState } from 'react'
import styles from './FieldMapCard.module.css'

/**
 * FieldMapCard — Leaflet-based interactive map
 * FIXED: Proper container initialization, CORS handling, error states
 * ✅ Works on Render & Vercel deployments
 */
export default function FieldMapCard({ lat, lng, label, zoom = 11, height = 280 }) {
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)

  const validLat = lat ?? 30.9
  const validLng = lng ?? 75.8
  const hasCoords = lat != null && lng != null

  useEffect(() => {
    if (!mapRef.current || leafletRef.current || mapError) return

    const loadLeaflet = async () => {
      try {
        // ✅ Load CSS if not already loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
          link.onerror = () => setMapError('Failed to load Leaflet CSS')
          document.head.appendChild(link)
          
          // Wait for CSS to load
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // ✅ Load JS if not already loaded
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // ✅ Ensure container is properly sized before initializing
        if (mapRef.current && mapRef.current.offsetHeight === 0) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        const L = window.L
        
        // ✅ Clean up existing map if any
        if (leafletRef.current) {
          leafletRef.current.remove()
        }

        // ✅ Initialize map with proper settings
        const map = L.map(mapRef.current, {
          center: [validLat, validLng],
          zoom,
          zoomControl: true,
          scrollWheelZoom: false,
          touchZoom: true,
          doubleClickZoom: true
        })

        // ✅ Add tile layer with CORS headers
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
          maxZoom: 18,
          crossOrigin: 'anonymous'  // ✅ IMPORTANT for deployed servers
        }).addTo(map)

        // ✅ Custom green marker
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width:14px;
            height:14px;
            background:#3d6b45;
            border:2.5px solid #8fb07a;
            border-radius:50%;
            box-shadow:0 0 0 4px rgba(61,107,69,0.25);
            box-sizing:border-box;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })

        // ✅ Add marker with popup
        L.marker([validLat, validLng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${label || 'Farm location'}</strong><br/>${validLat.toFixed(4)}, ${validLng.toFixed(4)}`)

        // ✅ Force map resize to render correctly
        setTimeout(() => {
          map.invalidateSize()
        }, 100)

        leafletRef.current = map
        setMapLoaded(true)
        setMapError(null)

      } catch (err) {
        console.warn('[FieldMapCard] Map initialization failed:', err.message)
        setMapError(err.message)
      }
    }

    loadLeaflet()

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [validLat, validLng, zoom])

  return (
    <div className={styles.wrap}>
      <div 
        className={styles.mapContainer} 
        style={{ height, position: 'relative' }} 
        ref={mapRef}
      >
        {!mapLoaded && !mapError && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#888',
            fontSize: '12px',
            zIndex: 1
          }}>
            Loading map...
          </div>
        )}
        {mapError && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            color: '#d32f2f',
            fontSize: '12px',
            textAlign: 'center',
            padding: '10px',
            zIndex: 1
          }}>
            <span>Map failed to load. Using fallback coordinates.</span>
          </div>
        )}
      </div>

      <div className={styles.coordBar}>
        <span className={styles.coordIcon}>📍</span>
        <span className={styles.coordLabel}>{label || 'Farm location'}</span>
        {hasCoords && (
          <span className={styles.coordValues}>
            {validLat.toFixed(4)}°N, {validLng.toFixed(4)}°E
          </span>
        )}
        {!hasCoords && (
          <span className={styles.coordMissing}>No coordinates set</span>
        )}
      </div>
    </div>
  )
}
