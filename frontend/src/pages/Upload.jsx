// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import toast from 'react-hot-toast'
// import api from '../utils/api'
// import { parseCSV, DEMO_DATASETS } from '../utils/analysis'
// import FieldMapCard from '../components/FieldMapCard'
// import styles from './Upload.module.css'

// export default function Upload() {
//   const [file, setFile]         = useState(null)
//   const [dragging, setDragging] = useState(false)
//   const [name, setName]         = useState('')
//   const [cropType, setCropType] = useState('wheat')
//   const [location, setLocation] = useState({ lat: null, lng: null, label: '' })
//   const [uploading, setUploading] = useState(false)
//   const fileRef = useRef()
//   const navigate = useNavigate()

//   const handleDrop = (e) => {
//     e.preventDefault(); setDragging(false)
//     const f = e.dataTransfer.files[0]
//     if (f?.name.endsWith('.csv')) { setFile(f); setName(n => n || f.name.replace('.csv', '')) }
//     else toast.error('Please drop a .csv file')
//   }

//   const uploadCSV = async () => {
//     if (!file) { toast.error('Select a CSV file first'); return }
//     setUploading(true)
//     try {
//       const text = await file.text()
//       const ts   = parseCSV(text)
//       if (ts.length < 5) throw new Error('Need at least 5 data points')

//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('name', name || file.name)
//       formData.append('cropType', cropType)
//       if (location.lat) formData.append('lat', location.lat)
//       if (location.lng) formData.append('lng', location.lng)
//       if (location.label) formData.append('locationLabel', location.label)

//       const res = await api.post('/data/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       toast.success('Analysis complete! 🌱')
//       navigate(`/analysis/${res.data.cropData._id}`)
//     } catch (err) {
//       toast.error(err.response?.data?.message || err.message)
//     } finally {
//       setUploading(false)
//     }
//   }

//   const loadDemo = async (key) => {
//     setUploading(true)
//     try {
//       const res = await api.post('/data/demo', { demoKey: key })
//       toast.success(`Loaded: ${DEMO_DATASETS[key].name}`)
//       navigate(`/analysis/${res.data.cropData._id}`)
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to load demo')
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <div className={`${styles.page} fade-in`}>
//       {/* CSV Upload */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>Upload CSV data</div>
//         <div className={styles.cardSub}>File must have <code>date</code> and <code>ndvi</code> columns · min 5 rows</div>

//         <div
//           className={`${styles.dropzone} ${dragging ? styles.drag : ''} ${file ? styles.hasFile : ''}`}
//           onDragOver={e => { e.preventDefault(); setDragging(true) }}
//           onDragLeave={() => setDragging(false)}
//           onDrop={handleDrop}
//           onClick={() => fileRef.current.click()}
//         >
//           <div className={styles.dropIcon}>{file ? '✅' : '📄'}</div>
//           <div className={styles.dropTitle}>{file ? file.name : 'Drop CSV file here or click to browse'}</div>
//           <div className={styles.dropSub}>
//             {file ? `${(file.size/1024).toFixed(1)} KB · Ready to analyze` : 'Max 5MB · date,ndvi columns required'}
//           </div>
//           <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => {
//             const f = e.target.files[0]; if (f) { setFile(f); setName(n => n || f.name.replace('.csv','')) }
//           }} />
//         </div>

//         <div className={styles.row}>
//           <div className={styles.field}>
//             <label className={styles.label}>Dataset name</label>
//             <input className={styles.input} placeholder="My wheat dataset" value={name} onChange={e => setName(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label className={styles.label}>Crop type</label>
//             <select className={styles.input} value={cropType} onChange={e => setCropType(e.target.value)}>
//               <option value="wheat">🌾 Wheat</option>
//               <option value="rice">🌿 Rice</option>
//               <option value="corn">🌽 Corn</option>
//               <option value="soybean">🫘 Soybean</option>
//               <option value="cotton">🩶 Cotton</option>
//               <option value="other">🌱 Other</option>
//             </select>
//           </div>
//         </div>

//         <button className={styles.btnPrimary} onClick={uploadCSV} disabled={uploading}>
//           {uploading ? 'Analyzing...' : 'Analyze File →'}
//         </button>
//       </div>

//       {/* Location picker */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>Field location <span className={styles.optional}>(optional)</span></div>
//         <div className={styles.cardSub}>Click on the map to pin your field. Improves weather data accuracy.</div>
//         <div className={styles.locRow}>
//           <div className={styles.mapWrap}>
//             <FieldMapCard
//               mode="picker"
//               onLocationSelect={(lat, lng) => setLocation(l => ({ ...l, lat, lng }))}
//               height={220}
//             />
//           </div>
//           <div className={styles.locFields}>
//             <div className={styles.field}>
//               <label className={styles.label}>Location label</label>
//               <input
//                 className={styles.input}
//                 placeholder="e.g. Punjab, India"
//                 value={location.label}
//                 onChange={e => setLocation(l => ({ ...l, label: e.target.value }))}
//               />
//             </div>
//             <div className={styles.field}>
//               <label className={styles.label}>Latitude</label>
//               <input
//                 className={styles.input}
//                 placeholder="Auto-filled from map"
//                 value={location.lat ? location.lat.toFixed(5) : ''}
//                 onChange={e => setLocation(l => ({ ...l, lat: parseFloat(e.target.value) || null }))}
//               />
//             </div>
//             <div className={styles.field}>
//               <label className={styles.label}>Longitude</label>
//               <input
//                 className={styles.input}
//                 placeholder="Auto-filled from map"
//                 value={location.lng ? location.lng.toFixed(5) : ''}
//                 onChange={e => setLocation(l => ({ ...l, lng: parseFloat(e.target.value) || null }))}
//               />
//             </div>
//             {location.lat && (
//               <div className={styles.locConfirm}>
//                 📍 Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Demo datasets */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>Demo datasets</div>
//         <div className={styles.cardSub}>Pre-loaded Indian agricultural NDVI data — no upload needed</div>
//         <div className={styles.demoGrid}>
//           {Object.entries(DEMO_DATASETS).map(([key, d]) => (
//             <div key={key} className={styles.demoCard} onClick={() => !uploading && loadDemo(key)}>
//               <div className={styles.demoIcon}>{d.icon}</div>
//               <div className={styles.demoName}>{d.name}</div>
//               <div className={styles.demoLoc}>📍 {d.location}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Format reference */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>CSV format</div>
//         <pre className={styles.codeBlock}>{`date,ndvi\n2023-11-01,0.12\n2023-12-15,0.31\n2024-01-15,0.55\n2024-03-15,0.85\n2024-06-01,0.18`}</pre>
//         <div className={styles.hint}>ISO dates (YYYY-MM-DD) · NDVI floats between -1 and 1 · Minimum 5 rows</div>
//       </div>
//     </div>
//   )
// }
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import toast from 'react-hot-toast'
// import api from '../utils/api'
// import { parseCSV, DEMO_DATASETS } from '../utils/analysis'
// import FieldMapCard from '../components/FieldMapCard'
// import styles from './Upload.module.css'

// export default function Upload() {
//   const [file, setFile] = useState(null)
//   const [dragging, setDragging] = useState(false)
//   const [name, setName] = useState('')
//   const [cropType, setCropType] = useState('wheat')
//   const [location, setLocation] = useState({ lat: null, lng: null, label: '' })
//   const [uploading, setUploading] = useState(false)

//   const fileRef = useRef()
//   const navigate = useNavigate()

//   const handleDrop = (e) => {
//     e.preventDefault()
//     setDragging(false)
//     const f = e.dataTransfer.files[0]

//     if (f?.name.endsWith('.csv')) {
//       setFile(f)
//       setName((n) => n || f.name.replace('.csv', ''))
//     } else {
//       toast.error('Please drop a .csv file')
//     }
//   }

//   const uploadCSV = async () => {
//     if (!file) {
//       toast.error('Select a CSV file first')
//       return
//     }

//     // ✅ VALIDATE LOCATION
//     if (
//       (location.lat !== null && typeof location.lat !== 'number') ||
//       (location.lng !== null && typeof location.lng !== 'number')
//     ) {
//       toast.error('Invalid coordinates')
//       return
//     }

//     setUploading(true)

//     try {
//       const text = await file.text()
//       const ts = parseCSV(text)

//       if (ts.length < 5) throw new Error('Need at least 5 data points')

//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('name', name || file.name)
//       formData.append('cropType', cropType)

//       // ✅ SAFE APPEND
//       if (typeof location.lat === 'number') formData.append('lat', location.lat)
//       if (typeof location.lng === 'number') formData.append('lng', location.lng)
//       if (location.label) formData.append('locationLabel', location.label)

//       const res = await api.post('/data/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })

//       toast.success('Analysis complete! 🌱')
//       navigate(`/analysis/${res.data.cropData._id}`)

//     } catch (err) {
//       toast.error(err.response?.data?.message || err.message)
//     } finally {
//       setUploading(false)
//     }
//   }

//   const loadDemo = async (key) => {
//     setUploading(true)
//     try {
//       const res = await api.post('/data/demo', { demoKey: key })
//       toast.success(`Loaded: ${DEMO_DATASETS[key].name}`)
//       navigate(`/analysis/${res.data.cropData._id}`)
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to load demo')
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <div className={`${styles.page} fade-in`}>

//       {/* CSV Upload */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>Upload CSV data</div>
//         <div className={styles.cardSub}>
//           File must have <code>date</code> and <code>ndvi</code> columns · min 5 rows
//         </div>

//         <div
//           className={`${styles.dropzone} ${dragging ? styles.drag : ''} ${file ? styles.hasFile : ''}`}
//           onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
//           onDragLeave={() => setDragging(false)}
//           onDrop={handleDrop}
//           onClick={() => fileRef.current.click()}
//         >
//           <div className={styles.dropIcon}>{file ? '✅' : '📄'}</div>
//           <div className={styles.dropTitle}>
//             {file ? file.name : 'Drop CSV file here or click to browse'}
//           </div>
//           <div className={styles.dropSub}>
//             {file
//               ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyze`
//               : 'Max 5MB · date,ndvi columns required'}
//           </div>

//           <input
//             ref={fileRef}
//             type="file"
//             accept=".csv"
//             style={{ display: 'none' }}
//             onChange={(e) => {
//               const f = e.target.files[0]
//               if (f) {
//                 setFile(f)
//                 setName((n) => n || f.name.replace('.csv', ''))
//               }
//             }}
//           />
//         </div>

//         <div className={styles.row}>
//           <div className={styles.field}>
//             <label className={styles.label}>Dataset name</label>
//             <input
//               className={styles.input}
//               placeholder="My wheat dataset"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div className={styles.field}>
//             <label className={styles.label}>Crop type</label>
//             <select
//               className={styles.input}
//               value={cropType}
//               onChange={(e) => setCropType(e.target.value)}
//             >
//               <option value="wheat">🌾 Wheat</option>
//               <option value="rice">🌿 Rice</option>
//               <option value="corn">🌽 Corn</option>
//               <option value="soybean">🫘 Soybean</option>
//               <option value="cotton">🩶 Cotton</option>
//               <option value="other">🌱 Other</option>
//             </select>
//           </div>
//         </div>

//         <button className={styles.btnPrimary} onClick={uploadCSV} disabled={uploading}>
//           {uploading ? 'Analyzing...' : 'Analyze File →'}
//         </button>
//       </div>

//       {/* Location Picker */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>
//           Field location <span className={styles.optional}>(optional)</span>
//         </div>

//         <div className={styles.cardSub}>
//           Click on the map or enter coordinates manually
//         </div>

//         <div className={styles.locRow}>

//           <div className={styles.mapWrap}>
//             <FieldMapCard
//               mode="picker"
//               onLocationSelect={(lat, lng) =>
//                 setLocation((l) => ({ ...l, lat, lng }))
//               }
//               height={220}
//             />
//           </div>

//           <div className={styles.locFields}>

//             <div className={styles.field}>
//               <label className={styles.label}>Location label</label>
//               <input
//                 className={styles.input}
//                 placeholder="e.g. Punjab, India"
//                 value={location.label}
//                 onChange={(e) =>
//                   setLocation((l) => ({ ...l, label: e.target.value }))
//                 }
//               />
//             </div>

//             {/* ✅ FIXED LAT INPUT */}
//             <div className={styles.field}>
//               <label className={styles.label}>Latitude</label>
//               <input
//                 type="number"
//                 step="any"
//                 className={styles.input}
//                 placeholder="Enter latitude"
//                 value={location.lat ?? ''}
//                 onChange={(e) => {
//                   const val = e.target.value
//                   setLocation((l) => ({
//                     ...l,
//                     lat: val === '' ? null : Number(val)
//                   }))
//                 }}
//               />
//             </div>

//             {/* ✅ FIXED LNG INPUT */}
//             <div className={styles.field}>
//               <label className={styles.label}>Longitude</label>
//               <input
//                 type="number"
//                 step="any"
//                 className={styles.input}
//                 placeholder="Enter longitude"
//                 value={location.lng ?? ''}
//                 onChange={(e) => {
//                   const val = e.target.value
//                   setLocation((l) => ({
//                     ...l,
//                     lng: val === '' ? null : Number(val)
//                   }))
//                 }}
//               />
//             </div>

//             {typeof location.lat === 'number' && typeof location.lng === 'number' && (
//               <div className={styles.locConfirm}>
//                 📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Demo */}
//       <div className={styles.card}>
//         <div className={styles.cardTitle}>Demo datasets</div>
//         <div className={styles.demoGrid}>
//           {Object.entries(DEMO_DATASETS).map(([key, d]) => (
//             <div key={key} className={styles.demoCard} onClick={() => !uploading && loadDemo(key)}>
//               <div className={styles.demoName}>{d.name}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }
// ---------------------------------------------------------------------------------------------------------------------
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { parseCSV, DEMO_DATASETS } from '../utils/analysis'
import LocationPicker from '../components/LocationPicker' // ✅ FIXED
import styles from './Upload.module.css'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [name, setName] = useState('')
  const [cropType, setCropType] = useState('wheat')
  const [location, setLocation] = useState({ lat: null, lng: null, label: '' })
  const [uploading, setUploading] = useState(false)

  const fileRef = useRef()
  const navigate = useNavigate()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]

    if (f?.name.endsWith('.csv')) {
      setFile(f)
      setName((n) => n || f.name.replace('.csv', ''))
    } else {
      toast.error('Please drop a .csv file')
    }
  }

  const uploadCSV = async () => {
    if (!file) {
      toast.error('Select a CSV file first')
      return
    }

    // ✅ VALIDATION
    if (
      (location.lat !== null && typeof location.lat !== 'number') ||
      (location.lng !== null && typeof location.lng !== 'number')
    ) {
      toast.error('Invalid coordinates')
      return
    }

    setUploading(true)

    try {
      const text = await file.text()
      const ts = parseCSV(text)

      if (ts.length < 5) throw new Error('Need at least 5 data points')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name || file.name)
      formData.append('cropType', cropType)

      
      if (typeof location.lat === 'number') formData.append('lat', location.lat)
      if (typeof location.lng === 'number') formData.append('lng', location.lng)
      if (location.label) formData.append('locationLabel', location.label)

      const res = await api.post('/api/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Analysis complete! 🌱')
      navigate(`/analysis/${res.data.cropData._id}`)

    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setUploading(false)
    }
  }

  const loadDemo = async (key) => {
    setUploading(true)
    try {
      const res = await api.post('/data/demo', { demoKey: key })
      toast.success(`Loaded: ${DEMO_DATASETS[key].name}`)
      navigate(`/analysis/${res.data.cropData._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load demo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`${styles.page} fade-in`}>

      {/* CSV Upload */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Upload CSV data</div>
        <div className={styles.cardSub}>
          File must have <code>date</code> and <code>ndvi</code> columns · min 5 rows
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.drag : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <div className={styles.dropIcon}>{file ? '✅' : '📄'}</div>
          <div className={styles.dropTitle}>
            {file ? file.name : 'Drop CSV file here or click to browse'}
          </div>
          <div className={styles.dropSub}>
            {file
              ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyze`
              : 'Max 5MB · date,ndvi columns required'}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files[0]
              if (f) {
                setFile(f)
                setName((n) => n || f.name.replace('.csv', ''))
              }
            }}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Dataset name</label>
            <input
              className={styles.input}
              placeholder="My dataset"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Crop type</label>
            <select
              className={styles.input}
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
            >
              <option value="wheat">🌾 Wheat</option>
              <option value="rice">🌿 Rice</option>
              <option value="corn">🌽 Corn</option>
              <option value="other">🌱 Other</option>
            </select>
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={uploadCSV} disabled={uploading}>
          {uploading ? 'Analyzing...' : 'Analyze File →'}
        </button>
      </div>

      {/* ✅ LOCATION PICKER FIXED */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Field location <span className={styles.optional}>(optional)</span>
        </div>

        <LocationPicker
          value={location}
          onChange={(loc) => setLocation(loc)}
        />

        {/* MANUAL INPUT */}
        <div className={styles.row}>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={location.lat ?? ''}
            onChange={(e) => {
              const val = e.target.value
              setLocation(l => ({
                ...l,
                lat: val === '' ? null : Number(val)
              }))
            }}
          />

          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={location.lng ?? ''}
            onChange={(e) => {
              const val = e.target.value
              setLocation(l => ({
                ...l,
                lng: val === '' ? null : Number(val)
              }))
            }}
          />
        </div>
      </div>

      {/* DEMO */}
     <div className={styles.demoSection}>
  <h3 className={styles.demoTitle}>Demo datasets</h3>

  <div className={styles.demoGrid}>
    <button
      className={styles.demoCard}
      onClick={() => handleDemoLoad('wheat_india')}
    >
      🌾 <span>Wheat — Punjab, India (2023)</span>
    </button>

    <button
      className={styles.demoCard}
      onClick={() => handleDemoLoad('rice_kerala')}
    >
      🌱 <span>Rice — Kerala, India (2023)</span>
    </button>

    <button
      className={styles.demoCard}
      onClick={() => handleDemoLoad('corn_maharashtra')}
    >
      🌽 <span>Corn — Maharashtra, India (2023)</span>
    </button>
  </div>
</div>

    </div>
  )
}