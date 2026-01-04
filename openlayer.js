import { Map, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { Icon, Style, Stroke, Fill, Text, Circle as CircleStyle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { createClient } from '@supabase/supabase-js';

// --- 1. KONEKSI SUPABASE ---
const supabase = createClient(
    'https://jktwgbtyjnbvcwdnefyj.supabase.co',
    'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX'
);

// --- 2. CONFIG STATE ---
let isFillActive = true; 
let activeBufferType = 'pengunjung';
let hoveredFeature = null; 
const BASE_RADIUS_VALUE = 350;

// --- 3. UI ELEMENT SETUP ---
const infoCard = document.getElementById('info-card');
const cardContent = document.getElementById('card-content');
const closeBtn = document.getElementById('close-card');

closeBtn.onclick = (e) => {
    e.preventDefault();
    infoCard.style.display = 'none';
};

// --- 4. FUNGSI PEMBANTU WARNA ---
const stringToRgb = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = Math.abs((hash & 0xFF0000) >> 16);
    const g = Math.abs((hash & 0x00FF00) >> 8);
    const b = Math.abs(hash & 0x0000FF);
    return `rgba(${r % 255}, ${g % 255}, ${b % 255}, 0.5)`;
};

// --- 5. STYLE RTH & BUFFER ---
const getDynamicStyle = (feature, resolution) => {
    const jenis = feature.get('Jenis RTH') || "";
    const checked = Array.from(document.querySelectorAll('.filter-rth:checked')).map(cb => cb.value);
    if (!checked.some(val => jenis.includes(val))) return null;

    const rawValue = String(feature.get(activeBufferType + '_raw') || "").trim().toLowerCase();
    let score = 0;

    // Logika Scoring Buffer
    if (activeBufferType === 'fasilitas') {
        if (rawValue === 'lengkap') score = 100;
        else if (rawValue === 'cukup') score = 60;
        else score = 20; 
    } else if (activeBufferType === 'kebersihan') {
        if (rawValue === 'tinggi') score = 100;
        else if (rawValue === 'sedang') score = 60;
        else score = 20;
    } else {
        const num = parseInt(rawValue);
        if (num > 100 || rawValue === 'padat') score = 100;
        else if (num > 40 || rawValue === 'sedang') score = 60;
        else score = 20;
    }

    let color = 'rgba(211, 47, 47, 0.4)'; 
    if (score >= 75) color = 'rgba(56, 142, 60, 0.4)'; 
    else if (score >= 40) color = 'rgba(251, 192, 45, 0.4)'; 

    const radiusInPixel = BASE_RADIUS_VALUE / resolution;
    let iconSrc = 'icon/jalur_hijau.png';
    if (jenis.includes('Taman')) iconSrc = 'icon/taman.png';
    else if (jenis.includes('Hutan')) iconSrc = 'icon/hutan_kota.png';
    else if (jenis.includes('Kebun')) iconSrc = 'icon/kebun_bibit.png';

    return [
        new Style({
            image: new CircleStyle({
                radius: radiusInPixel,
                fill: new Fill({ color: color }),
                stroke: new Stroke({ color: color.replace('0.4', '0.8'), width: 1.5 })
            })
        }),
        new Style({
            image: new Icon({
                src: iconSrc,
                anchor: [0.5, 0.5],
                scale: 0.18,
                crossOrigin: 'anonymous'
            })
        })
    ];
};

// --- 6. LAYERS ---
const kecamatanLayer = new VectorLayer({
    source: new VectorSource({
        url: 'data/kec_pekan.json', 
        format: new GeoJSON(),
    }),
    style: function (feature) {
        const namaKec = feature.get('Kecamatan') || feature.get('NAMOBJ') || "Wilayah";
        const isHovered = feature === hoveredFeature; 
        let currentFillColor = isFillActive ? stringToRgb(namaKec.toUpperCase()) : 'rgba(0, 0, 0, 0)';
        
        if (isHovered) {
            currentFillColor = isFillActive ? currentFillColor.replace('0.5', '0.8') : 'rgba(46, 125, 50, 0.2)'; 
        }

        return new Style({
            stroke: new Stroke({
                color: isHovered ? '#2e7d32' : 'rgba(0, 0, 0, 0.5)',
                width: isHovered ? 3 : 1, 
            }),
            fill: new Fill({ color: currentFillColor }),
            text: new Text({
                text: namaKec,
                font: isHovered ? 'bold 14px Segoe UI' : 'bold 11px Segoe UI', 
                fill: new Fill({ color: isHovered ? '#1b5e20' : '#333' }),
                stroke: new Stroke({ color: '#fff', width: 2 }),
                overflow: true
            })
        });
    }
});

const rthSource = new VectorSource();
const rthLayer = new VectorLayer({
    source: rthSource,
    style: (f, res) => getDynamicStyle(f, res)
});

// --- 7. INITIALIZE MAP ---
const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({ source: new OSM() }), 
        kecamatanLayer, 
        rthLayer
    ],
    view: new View({ 
        center: fromLonLat([101.4478, 0.5070]), 
        zoom: 12 
    })
});

// --- 8. EVENT LISTENERS ---

// Hover Wilayah
map.on('pointermove', (evt) => {
    if (evt.dragging) return;
    const pixel = map.getEventPixel(evt.originalEvent);
    const feature = map.forEachFeatureAtPixel(pixel, (f) => f, {
        layerFilter: (l) => l === kecamatanLayer
    });
    if (feature !== hoveredFeature) {
        hoveredFeature = feature;
        kecamatanLayer.changed();
    }
    map.getTargetElement().style.cursor = map.hasFeatureAtPixel(pixel) ? 'pointer' : '';
});

// Interaction Filters
document.getElementById('toggle-kecamatan').onchange = (e) => {
    isFillActive = e.target.checked;
    kecamatanLayer.changed();
};

document.getElementById('filter-buffer-type').onchange = (e) => {
    activeBufferType = e.target.value;
    rthLayer.changed();
};

document.querySelectorAll('.filter-rth').forEach(cb => {
    cb.onchange = () => rthLayer.changed();
});

// --- 9. LOAD DATA SUPABASE ---
async function loadData() {
    try {
        const { data, error } = await supabase.from('Data_RTH').select('*');
        if (error) throw error;

        const features = data.map(rth => {
            const lon = parseFloat(rth.LONG);
            const lat = parseFloat(rth.LAT);
            if (isNaN(lon) || isNaN(lat)) return null;
            return new Feature({
                geometry: new Point(fromLonLat([lon, lat])),
                'Nama RTH': rth["Nama RTH"],
                'Jenis RTH': rth["Jenis RTH"],
                'Luas': rth.Luas,
                'pengunjung_raw': rth["Rata-rata Pengunjung"] || "-",
                'kebersihan_raw': rth["Tingkat Kebersihan"] || "-",
                'fasilitas_raw': rth["Fasilitas RTH"] || "-"
            });
        }).filter(f => f !== null);

        rthSource.clear();
        rthSource.addFeatures(features);
    } catch (err) { console.error("Error:", err.message); }
}

// --- 10. CLICK EVENT (Show Card) ---
map.on('singleclick', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    
    if (feature && feature.get('Nama RTH')) {
        infoCard.style.display = 'block';
        cardContent.innerHTML = `
            <div style="margin-top: 10px;">
                <h3 style="margin: 0; color: #2e7d32; font-size: 16px;">🌳 ${feature.get('Nama RTH')}</h3>
                <p style="font-size: 11px; color: #666; margin: 4px 0 10px 0;">${feature.get('Jenis RTH')}</p>
                
                <div style="font-size: 12px; line-height: 1.6;">
                    <b>📍 Luas:</b> ${feature.get('Luas')} m²<br>
                    <div style="background: #f1f8e9; padding: 10px; border-radius: 8px; margin-top: 10px;">
                        👥 <b>Pengunjung:</b> ${feature.get('pengunjung_raw')}<br>
                        ✨ <b>Kebersihan:</b> ${feature.get('kebersihan_raw')}<br>
                        🛠️ <b>Fasilitas:</b> ${feature.get('fasilitas_raw')}
                    </div>
                </div>
                
                <button style="width: 100%; margin-top: 15px; background: #2e7d32; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    Detail Lengkap
                </button>
            </div>
        `;
        
        // Animasi Zoom ke titik yang diklik
        map.getView().animate({
            center: feature.getGeometry().getCoordinates(),
            zoom: 15,
            duration: 800
        });
    }
});

loadData();