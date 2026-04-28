// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import toast from 'react-hot-toast'
// import api from '../utils/api'
// import { formatDate, cropIcon } from '../utils/analysis'
// import styles from './History.module.css'

// export default function History() {
//   const [datasets, setDatasets] = useState([])
//   const [loading, setLoading]   = useState(true)
//   const [deleting, setDeleting] = useState(null)
//   const navigate = useNavigate()

//   useEffect(() => { loadDatasets() }, [])

//   const loadDatasets = async () => {
//     try {
//       const res = await api.get('/data')
//       setDatasets(res.data.datasets || [])
//     } catch {
//       toast.error('Failed to load datasets')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (id, e) => {
//     e.stopPropagation()
//     if (!confirm('Delete this dataset and its analysis?')) return
//     setDeleting(id)
//     try {
//       await api.delete(`/data/${id}`)
//       setDatasets(prev => prev.filter(d => d._id !== id))
//       toast.success('Dataset deleted')
//     } catch {
//       toast.error('Failed to delete dataset')
//     } finally {
//       setDeleting(null)
//     }
//   }

//   if (loading) return (
//     <div className={styles.loading}>
//       <div className={styles.spinner} />
//       Loading datasets...
//     </div>
//   )

//   if (!datasets.length) return (
//     <div className={styles.empty}>
//       <div className={styles.emptyIcon}>📂</div>
//       <p>No datasets yet.</p>
//       <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
//         Upload Your First Dataset →
//       </button>
//     </div>
//   )

//   return (
//     <div className={`${styles.page} fade-in`}>
//       <div className={styles.header}>
//         <div>
//           <h2 className={styles.title}>My Datasets</h2>
//           <p className={styles.sub}>{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} stored</p>
//         </div>
//         <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
//           + New Analysis
//         </button>
//       </div>

//       <div className={styles.list}>
//         {datasets.map(d => (
//           <div key={d._id} className={styles.item} onClick={() => navigate(`/analysis/${d._id}`)}>
//             <div className={styles.itemIcon}>{cropIcon(d.cropType)}</div>
//             <div className={styles.itemMain}>
//               <div className={styles.itemName}>{d.name}</div>
//               <div className={styles.itemMeta}>
//                 <span className={styles.tag}>{d.cropType}</span>
//                 <span className={styles.dot}>·</span>
//                 <span>{d.source === 'demo' ? 'Demo dataset' : 'CSV upload'}</span>
//                 <span className={styles.dot}>·</span>
//                 <span>{formatDate(d.uploadedAt)}</span>
//               </div>
//             </div>
//             <div className={styles.itemActions}>
//               <button
//                 className={styles.btnAnalyze}
//                 onClick={e => { e.stopPropagation(); navigate(`/analysis/${d._id}`) }}
//               >
//                 Analyze →
//               </button>
//               <button
//                 className={styles.btnDelete}
//                 onClick={e => handleDelete(d._id, e)}
//                 disabled={deleting === d._id}
//               >
//                 {deleting === d._id ? '...' : '✕'}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
// -----------------------------------------------------------------------------------------------------------------
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { formatDate, cropIcon } from '../utils/analysis'
import styles from './History.module.css'

export default function History() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError]       = useState(null)  // ✅ Track error separately
  const navigate = useNavigate()

  useEffect(() => { loadDatasets() }, [])

  const loadDatasets = async () => {
    try {
      setLoading(true)
      setError(null)  // Clear previous errors
      
      const res = await api.get('/data')
      
      // ✅ Better error checking
      if (!res.data) {
        setError('No response from server')
        setDatasets([])
        return
      }
      
      const ds = res.data.datasets || []
      setDatasets(ds)
      
      // ✅ Don't show error toast for empty datasets
      // It's normal to have no datasets on first load
      if (ds.length === 0) {
        console.log('No datasets - this is normal on first load')
      }
      
    } catch (err) {
      // ✅ Better error handling
      console.error('Failed to load datasets:', err)
      
      const errorMsg = err.response?.data?.message 
        || err.message 
        || 'Failed to load datasets'
      
      setError(errorMsg)
      setDatasets([])
      
      // ✅ Only show toast for actual errors, not for empty state
      if (err.response?.status !== 404) {  // 404 is OK (no datasets)
        toast.error(errorMsg)
      }
      
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this dataset and its analysis?')) return
    
    setDeleting(id)
    try {
      await api.delete(`/data/${id}`)
      setDatasets(prev => prev.filter(d => d._id !== id))
      toast.success('Dataset deleted')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete dataset'
      toast.error(errorMsg)
      console.error('Delete error:', err)
    } finally {
      setDeleting(null)
    }
  }

  // ✅ Loading state
  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      Loading datasets...
    </div>
  )

  // ✅ Error state (show if fetch actually failed)
  if (error && datasets.length === 0) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>⚠️</div>
      <p className={styles.emptyTitle}>{error}</p>
      <p className={styles.emptySub}>Try uploading your first dataset or refresh the page</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
          + Upload Dataset
        </button>
        <button className={styles.btnSecondary} onClick={loadDatasets}>
          ↻ Retry
        </button>
      </div>
    </div>
  )

  // ✅ Empty state (normal - no datasets uploaded yet)
  if (datasets.length === 0) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📂</div>
      <p className={styles.emptyTitle}>No datasets yet</p>
      <p className={styles.emptySub}>Upload your first NDVI CSV file to get started</p>
      <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
        Upload Your First Dataset →
      </button>
    </div>
  )

  // ✅ Success state - show datasets
  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>My Datasets</h2>
          <p className={styles.sub}>{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} stored</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
          + New Analysis
        </button>
      </div>

      <div className={styles.list}>
        {datasets.map(d => (
          <div 
            key={d._id} 
            className={styles.item} 
            onClick={() => navigate(`/analysis/${d._id}`)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.itemIcon}>{cropIcon(d.cropType)}</div>
            <div className={styles.itemMain}>
              <div className={styles.itemName}>{d.name || 'Untitled Dataset'}</div>
              <div className={styles.itemMeta}>
                <span className={styles.tag}>{d.cropType || 'Unknown'}</span>
                <span className={styles.dot}>·</span>
                <span>{d.source === 'demo' ? '📌 Demo dataset' : '📤 CSV upload'}</span>
                <span className={styles.dot}>·</span>
                <span>{formatDate(d.uploadedAt) || 'Recently'}</span>
              </div>
            </div>
            <div className={styles.itemActions}>
              <button
                className={styles.btnAnalyze}
                onClick={e => { 
                  e.stopPropagation()
                  navigate(`/analysis/${d._id}`) 
                }}
              >
                Analyze →
              </button>
              <button
                className={styles.btnDelete}
                onClick={e => handleDelete(d._id, e)}
                disabled={deleting === d._id}
                title="Delete dataset"
              >
                {deleting === d._id ? '⏳' : '✕'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
