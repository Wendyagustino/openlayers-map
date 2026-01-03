import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorSource } from 'ol/source.js';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj.js';
import { Icon, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

// 1. POPUP SETUP
const container = document.getElementById('popup');
const content_element = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
    element: container,
    autoPan: { animation: { duration: 250 } },
});

// === 2. STYLE FUNCTION DENGAN FILTER CHECKBOX ===
const rthStyleFunction = (feature) => {
    const jenis = feature.get('Jenis RTH') || "";
    
    // Ambil semua value dari checkbox yang sedang dicentang
    const checkedCheckboxes = Array.from(document.querySelectorAll('.filter-rth:checked'))
                                   .map(cb => cb.value);
    
    // Cek apakah jenis RTH ini termasuk yang dicentang
    const isVisible = checkedCheckboxes.some(val => jenis.includes(val));

    // Jika tidak dicentang, jangan tampilkan icon (return null)
    if (!isVisible) return null;

    // Logika pemilihan logo berdasarkan jenis
    let iconSrc = 'icon/rth.png';
    if (jenis.includes('Taman')) iconSrc = 'icon/taman.png';
    else if (jenis.includes('Jalur Hijau')) iconSrc = 'icon/jalur_hijau.png';
    else if (jenis.includes('Hutan')) iconSrc = 'icon/hutan_kota.png';
    else if (jenis.includes('Kebun Bibit')) iconSrc = 'icon/kebun_bibit.png';

    return new Style({
        image: new Icon({
            src: iconSrc,
            anchor: [0.5, 1],
            scale: 0.08
        })
    });
};

const rthSource = new VectorSource();
const rthLayer = new VectorLayer({
    source: rthSource,
    style: rthStyleFunction
});

// 3. LOAD DATA
async function loadRTHData() {
    try {
        const response = await fetch('/data/JSON_RTH.json');
        const data = await response.json();
        const features = data.features.map(f => {
            return new Feature({
                geometry: new Point(fromLonLat([f.geometry.x, f.geometry.y])),
                ...f.attributes 
            });
        });
        rthSource.addFeatures(features);
        console.log("✅ Data dimuat");
    } catch (err) {
        console.error("❌ Gagal:", err.message);
    }
}
loadRTHData();

// 4. MAP
const map = new Map({
    target: 'map',
    layers: [new TileLayer({ source: new OSM() }), rthLayer],
    overlays: [overlay],
    view: new View({
        center: fromLonLat([101.447778, 0.507068]),
        zoom: 12, 
    })
});

// === 5. EVENT LISTENER UNTUK REFRESH LAYER SAAT CHECKBOX DIKLIK ===
document.querySelectorAll('.filter-rth').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        rthLayer.changed(); // Memaksa layer menggambar ulang sesuai pilihan checkbox
    });
});

// 6. CLICK POPUP
map.on('singleclick', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (!feature) {
        overlay.setPosition(undefined);
        return;
    }
    const nama = feature.get('Nama RTH');
    content_element.innerHTML = `
        <h6 style="margin:0; color:#2e7d32;">🌳 ${nama}</h6>
        <p style="font-size:12px; margin:5px 0;"><b>Jenis:</b> ${feature.get('Jenis RTH')}</p>
        <p style="font-size:12px; margin:0;"><b>Lokasi:</b> ${feature.get('Lokasi')}</p>
    `;
    overlay.setPosition(evt.coordinate);
});

closer.onclick = () => { overlay.setPosition(undefined); return false; };