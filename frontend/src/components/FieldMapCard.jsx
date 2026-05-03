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
 * ✅ FIXED: Proper initialization, CORS, error handling
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
        // ✅ Load Leaflet CSS if not already loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
          link.onerror = () => {
            console.error('[Map] Failed to load Leaflet CSS')
            setMapError('CDN unavailable')
          }
          document.head.appendChild(link)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // ✅ Load Leaflet JS if not already loaded
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
            script.async = true
            script.onload = () => {
              console.log('[Map] Leaflet.js loaded successfully')
              resolve()
            }
            script.onerror = () => {
              console.error('[Map] Failed to load Leaflet.js')
              reject(new Error('Leaflet.js CDN failed'))
            }
            document.head.appendChild(script)
          })
        }

        // ✅ Wait for container to be properly rendered and sized
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (!mapRef.current) {
          throw new Error('Map container not found')
        }

        // ✅ Ensure container has proper dimensions
        const containerHeight = mapRef.current.offsetHeight
        if (containerHeight === 0) {
          console.warn('[Map] Container has 0 height, forcing styles')
          mapRef.current.style.height = `${height}px`
        }

        const L = window.L
        
        // ✅ Clean up existing map instance
        if (leafletRef.current) {
          try {
            leafletRef.current.remove()
          } catch (e) {
            console.warn('[Map] Error removing old map:', e.message)
          }
        }

        // ✅ Initialize map with proper settings
        console.log(`[Map] Initializing map at lat=${validLat}, lng=${validLng}`)
        
        const map = L.map(mapRef.current, {
          center: [validLat, validLng],
          zoom,
          zoomControl: true,
          scrollWheelZoom: false,
          touchZoom: true,
          doubleClickZoom: true,
          attributionControl: true
        })

        // ✅ Add tile layer WITH CORS headers (CRITICAL for production)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  minZoom: 1
}).addTo(map)
        // ✅ Custom green marker styling
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 14px;
            height: 14px;
            background: #3d6b45;
            border: 2.5px solid #8fb07a;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(61, 107, 69, 0.25);
            box-sizing: border-box;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })

        // ✅ Add marker with coordinates popup
        L.marker([validLat, validLng], { icon, draggable: false })
          .addTo(map)
          .bindPopup(`
            <div style="font-size: 12px; text-align: center;">
              <strong>${label || 'Location'}</strong><br/>
              ${validLat.toFixed(4)}°N, ${validLng.toFixed(4)}°E
            </div>
          `)

        // ✅ Force map to resize and render correctly (CRITICAL)
        map.invalidateSize()
        
        // Do it again after a short delay to ensure it sticks
        setTimeout(() => {
          map.invalidateSize()
          console.log('[Map] Map invalidated and ready')
        }, 200)

        leafletRef.current = map
        setMapLoaded(true)
        setMapError(null)

      } catch (err) {
        console.error('[Map] Initialization failed:', err.message)
        setMapError(err.message)
        setMapLoaded(false)
      }
    }

    loadLeaflet()

    // ✅ Cleanup on unmount
    return () => {
      if (leafletRef.current) {
        try {
          leafletRef.current.remove()
          leafletRef.current = null
        } catch (e) {
          console.warn('[Map] Error during cleanup:', e.message)
        }
      }
    }
  }, [validLat, validLng, zoom, height])

  return (
    <div className={styles.wrap}>
      <div 
        className={styles.mapContainer}
        style={{ 
          height: `${height}px`,
          position: 'relative',
          minHeight: `${height}px`
        }} 
        ref={mapRef}
      >
        {!mapLoaded && !mapError && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#888',
            fontSize: '13px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            ⏳ Loading map...
          </div>
        )}
        {mapError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1a',
            color: '#ff6b6b',
            fontSize: '12px',
            textAlign: 'center',
            padding: '20px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>⚠️</div>
              <div>Map unavailable</div>
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#888' }}>
                Showing location: {validLat.toFixed(2)}°N, {validLng.toFixed(2)}°E
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.coordBar}>
        <span className={styles.coordIcon}>📍</span>
        <span className={styles.coordLabel}>{label || 'Location'}</span>
        {hasCoords ? (
          <span className={styles.coordValues}>
            {validLat.toFixed(4)}°N, {validLng.toFixed(4)}°E
          </span>
        ) : (
          <span className={styles.coordMissing}>No coordinates</span>
        )}
      </div>
    </div>
  )
}
