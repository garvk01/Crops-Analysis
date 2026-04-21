import styles from './CropBanner.module.css'

// Per-crop metadata
export const CROP_INFO = {
  wheat: {
    sciName:        'Triticum aestivum',
    season:         'Rabi (winter) crop',
    sowingWindow:   'Oct 15 – Nov 15',
    harvestWindow:  'Apr – May',
    optimalNDVI:    '0.75 – 0.90',
    seasonLength:   '140 – 160 days',
    waterNeed:      '450 – 650 mm',
    criticalStages: 'Tillering, Anthesis',
    description:    "Wheat is India's most important winter cereal. Punjab and Haryana contribute over 50% of national output. NDVI rises sharply from December through March then declines toward harvest.",
    rainfall:       [20, 15, 18, 25, 30, 12, 6, 4],
    rainfallMonths: ['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'],
  },
  rice: {
    sciName:        'Oryza sativa',
    season:         'Kharif (monsoon) crop',
    sowingWindow:   'Jun – Jul',
    harvestWindow:  'Oct – Nov',
    optimalNDVI:    '0.70 – 0.85',
    seasonLength:   '110 – 140 days',
    waterNeed:      '1000 – 2000 mm',
    criticalStages: 'Transplanting, Flowering',
    description:    "Rice is Kerala's primary kharif staple. The crop benefits from southwest monsoon rains (Jun–Sep). NDVI peaks in September at active tillering and panicle initiation stages.",
    rainfall:       [280, 420, 390, 210, 60, 20, 15, 12],
    rainfallMonths: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
  },
  corn: {
    sciName:        'Zea mays',
    season:         'Kharif (summer) crop',
    sowingWindow:   'Jun 15 – Jul 15',
    harvestWindow:  'Nov – Dec',
    optimalNDVI:    '0.80 – 0.92',
    seasonLength:   '90 – 120 days',
    waterNeed:      '500 – 800 mm',
    criticalStages: 'Tasseling, Silking',
    description:    "Corn in Maharashtra is grown as a kharif crop using monsoon rainfall. It shows the fastest NDVI growth rate, peaking in September at the silking stage before rapid senescence.",
    rainfall:       [12, 190, 280, 180, 60, 18, 8, 5],
    rainfallMonths: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
  },
  soybean: {
    sciName:        'Glycine max',
    season:         'Kharif crop',
    sowingWindow:   'Jun – Jul',
    harvestWindow:  'Oct – Nov',
    optimalNDVI:    '0.65 – 0.82',
    seasonLength:   '90 – 110 days',
    waterNeed:      '450 – 700 mm',
    criticalStages: 'Pod formation, Seed fill',
    description:    "Soybean is Madhya Pradesh's dominant oilseed kharif crop. NDVI peaks at canopy closure in August–September, then declines rapidly as pods mature and leaves drop.",
    rainfall:       [15, 185, 270, 175, 55, 15, 7, 4],
    rainfallMonths: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
  },
  other: {
    sciName:        'Crop species',
    season:         'Variable',
    sowingWindow:   'Variable',
    harvestWindow:  'Variable',
    optimalNDVI:    '0.60 – 0.85',
    seasonLength:   '90 – 180 days',
    waterNeed:      'Variable',
    criticalStages: 'Vegetative, Reproductive',
    description:    "Custom uploaded dataset. Analysis is performed using the standard NDVI multi-temporal crop cycle detection algorithm with smoothing and threshold-based stage identification.",
    rainfall:       [40, 35, 30, 28, 25, 20, 18, 15],
    rainfallMonths: ['M1','M2','M3','M4','M5','M6','M7','M8'],
  },
}

// SVG scene for each crop type
function WheatScene() {
  return (
    <svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="180" fill="#c8e6c0"/>
      <rect y="120" width="280" height="60" fill="#8B6914" opacity=".28"/>
      <circle cx="245" cy="30" r="18" fill="#f5c842" opacity=".85"/>
      <ellipse cx="60" cy="22" rx="24" ry="11" fill="white" opacity=".6"/>
      <ellipse cx="78" cy="17" rx="17" ry="12" fill="white" opacity=".6"/>
      <ellipse cx="165" cy="28" rx="19" ry="9" fill="white" opacity=".45"/>
      {/* Trees */}
      <rect x="10" y="74" width="7" height="48" fill="#7a5c2e"/>
      <ellipse cx="13" cy="61" rx="18" ry="20" fill="#2d7a2a"/>
      <ellipse cx="5"  cy="70" rx="11" ry="14" fill="#3a9636"/>
      <ellipse cx="21" cy="68" rx="12" ry="15" fill="#3a9636"/>
      <rect x="252" y="77" width="6" height="45" fill="#7a5c2e"/>
      <ellipse cx="255" cy="64" rx="16" ry="18" fill="#2d7a2a"/>
      <ellipse cx="246" cy="72" rx="10" ry="13" fill="#3a9636"/>
      {/* Wheat stalks */}
      {[38,50,62,76,90,104,118,132,146,160,174,188,202,216,230].map((x, i) => (
        <g key={x} stroke="#7dc435" strokeLinecap="round">
          <line x1={x} y1="122" x2={x + (i%2===0?-3:3)} y2="83" strokeWidth="1.8"/>
          <ellipse cx={x+(i%2===0?-3:3)} cy="79" rx="4" ry="8"
            fill={i%3===0?"#d4c000":i%3===1?"#c8b400":"#bfa800"}
            transform={`rotate(${i%2===0?-5:6},${x+(i%2===0?-3:3)},79)`}/>
          {i%3===0 && <><line x1={x+(i%2===0?-3:3)} y1="99" x2={x+(i%2===0?-9:9)} y2="93" strokeWidth="1.2"/>
          <ellipse cx={x+(i%2===0?-9:9)} cy="91" rx="2" ry="4" fill="#c8b400" transform={`rotate(${i%2===0?-20:20},${x+(i%2===0?-9:9)},91)`}/></>}
        </g>
      ))}
      {/* Birds */}
      <path d="M95 40 Q99 35 103 40" stroke="#555" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M112 33 Q116 28 120 33" stroke="#555" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function RiceScene() {
  return (
    <svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="180" fill="#b2dfdb"/>
      <rect y="108" width="280" height="72" fill="#5c8a6e" opacity=".42"/>
      <circle cx="245" cy="28" r="16" fill="#f5c842" opacity=".8"/>
      {/* Rain clouds (rice is monsoon crop) */}
      <ellipse cx="60" cy="20" rx="26" ry="12" fill="white" opacity=".75"/>
      <ellipse cx="80" cy="15" rx="18" ry="13" fill="white" opacity=".75"/>
      <ellipse cx="42" cy="18" rx="14" ry="10" fill="white" opacity=".7"/>
      <ellipse cx="160" cy="22" rx="22" ry="10" fill="#b0bec5" opacity=".6"/>
      <ellipse cx="178" cy="18" rx="15" ry="11" fill="#b0bec5" opacity=".6"/>
      {/* Rain drops from cloud */}
      {[152,160,168,176,184].map(x => (
        <line key={x} x1={x} y1="30" x2={x-2} y2="40" stroke="#90caf9" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
      {/* Trees */}
      <rect x="8" y="68" width="6" height="52" fill="#6d4c41"/>
      <ellipse cx="11" cy="55" rx="15" ry="17" fill="#388e3c"/>
      <ellipse cx="3"  cy="63" rx="9"  ry="12" fill="#43a047"/>
      <rect x="257" y="71" width="6" height="48" fill="#6d4c41"/>
      <ellipse cx="260" cy="58" rx="14" ry="16" fill="#388e3c"/>
      <ellipse cx="269" cy="66" rx="9"  ry="12" fill="#43a047"/>
      {/* Rice stalks */}
      {[38,52,66,80,94,108,122,136,150,164,178,192,206,220,234].map((x, i) => (
        <g key={x} fill="none" stroke="#66bb6a" strokeLinecap="round">
          <line x1={x} y1="118" x2={x+(i%2===0?-2:2)} y2="86" strokeWidth="2"/>
          <line x1={x+(i%2===0?-2:2)} y1="100" x2={x+(i%2===0?-8:8)} y2="93" strokeWidth="1.5"/>
          <line x1={x+(i%2===0?-2:2)} y1="94"  x2={x+(i%2===0? 6:-6)} y2="87" strokeWidth="1.5"/>
        </g>
      ))}
      {/* Water reflection */}
      <rect x="0" y="133" width="280" height="7" fill="#80cbc4" opacity=".38"/>
      <rect x="0" y="148" width="280" height="5" fill="#80cbc4" opacity=".28"/>
    </svg>
  )
}

function CornScene() {
  return (
    <svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="180" fill="#dcedc8"/>
      <rect y="115" width="280" height="65" fill="#795548" opacity=".22"/>
      <circle cx="248" cy="28" r="17" fill="#f5c842" opacity=".85"/>
      <ellipse cx="55" cy="20" rx="22" ry="11" fill="white" opacity=".65"/>
      <ellipse cx="70" cy="15" rx="16" ry="12" fill="white" opacity=".65"/>
      <ellipse cx="170" cy="25" rx="18" ry="9"  fill="white" opacity=".45"/>
      {/* Trees */}
      <rect x="8"   y="68" width="7" height="50" fill="#6d4c41"/>
      <ellipse cx="11"  cy="54" rx="16" ry="18" fill="#2e7d32"/>
      <ellipse cx="3"   cy="63" rx="9"  ry="12" fill="#388e3c"/>
      <rect x="253" y="72" width="6" height="46" fill="#6d4c41"/>
      <ellipse cx="256" cy="59" rx="15" ry="17" fill="#2e7d32"/>
      <ellipse cx="265" cy="67" rx="9"  ry="12" fill="#388e3c"/>
      {/* Corn plants */}
      {[38,72,106,140,174,208].map((x, i) => (
        <g key={x} fill="none" strokeLinecap="round">
          <line x1={x+2} y1="118" x2={x+2} y2="60" stroke="#558b2f" strokeWidth="3"/>
          <path d={`M${x+2} 78 Q${x+17} 70 ${x+22} 61`} stroke="#7cb342" strokeWidth="1.8"/>
          <path d={`M${x+2} 90 Q${x-13} 82 ${x-18} 73`} stroke="#7cb342" strokeWidth="1.8"/>
          <rect x={x-2} y="73" width="8" height="16" rx="3" fill="#fdd835" stroke="#f9a825" strokeWidth="1"/>
          <line x1={x+2} y1="63" x2={x+2} y2="57" stroke="#8bc34a" strokeWidth="1.5"/>
        </g>
      ))}
      {/* Birds */}
      <path d="M120 38 Q124 33 128 38" stroke="#666" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M136 30 Q140 25 144 30" stroke="#666" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function OtherScene() {
  return <WheatScene />
}

const SceneComponents = { wheat: WheatScene, rice: RiceScene, corn: CornScene, soybean: WheatScene, other: OtherScene }

const CROP_ICONS = { wheat: '🌾', rice: '🌿', corn: '🌽', soybean: '🫘', cotton: '🩶', other: '🌱' }

export default function CropBanner({ cropType = 'other', datasetName, location }) {
  const info = CROP_INFO[cropType] || CROP_INFO.other
  const Icon = cropType in SceneComponents ? SceneComponents[cropType] : OtherScene
  const icon = CROP_ICONS[cropType] || '🌱'

  const facts = [
    ['Sowing window',   info.sowingWindow],
    ['Harvest window',  info.harvestWindow],
    ['Optimal NDVI',    info.optimalNDVI],
    ['Season length',   info.seasonLength],
    ['Water need',      info.waterNeed],
    ['Critical stages', info.criticalStages],
  ]

  return (
    <div className={styles.banner}>
      {/* Left: info */}
      <div className={styles.left}>
        <div className={styles.header}>
          <div className={styles.iconBox}>{icon}</div>
          <div>
            <div className={styles.name}>{datasetName || cropType}</div>
            <div className={styles.sci}>{info.sciName}</div>
            <div className={styles.loc}>📍 {location || 'India'} · {info.season}</div>
          </div>
        </div>
        <p className={styles.desc}>{info.description}</p>
        <div className={styles.facts}>
          {facts.map(([k, v]) => (
            <div key={k} className={styles.fact}>
              <div className={styles.factKey}>{k}</div>
              <div className={styles.factVal}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Right: SVG crop illustration */}
      <div className={styles.scene}>
        <Icon />
      </div>
    </div>
  )
}
