import './style.css';
import { Map, View, Feature, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { createClient } from '@supabase/supabase-js';

// --- 1. KONEKSI SUPABASE ---
const supabaseUrl = 'https://jktwgbtyjnbvcwdnefyj.supabase.co';
const supabaseKey = 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. POPUP SETUP ---
const container = document.getElementById('popup');
const content_element = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
    element: container,
    autoPan: { animation: { duration: 250 } },
});

if (closer) {
    closer.onclick = () => { overlay.setPosition(undefined); return false; };
}

// --- 3. STYLE FUNCTION (FILTER & LOGO BERBEDA) ---
const rthStyleFunction = (feature) => {
    // Sesuaikan dengan nama kolom di database: "Jenis RTH"
    const jenis = feature.get('Jenis RTH') || "";
    
    // Ambil semua value dari checkbox yang sedang dicentang
    const checkedCheckboxes = Array.from(document.querySelectorAll('.filter-rth:checked'))
                                   .map(cb => cb.value);
    
    // Cek apakah jenis RTH ini termasuk yang dicentang
    const isVisible = checkedCheckboxes.some(val => jenis.includes(val));

    // Jika tidak dicentang di checkbox, sembunyikan (null)
    if (!isVisible) return null;

    // Logika pemilihan logo berdasarkan isi kolom Jenis RTH
    let iconSrc = 'icon/jalur_hijau.png'; // Default
    if (jenis.includes('Taman')) iconSrc = 'icon/taman.png';
    else if (jenis.includes('Jalur Hijau')) iconSrc = 'icon/jalur_hijau.png';
    else if (jenis.includes('Hutan')) iconSrc = 'icon/hutan_kota.png';
    else if (jenis.includes('Kebun Bibit')) iconSrc = 'icon/kebun_bibit.png';
    else if (jenis.includes('Pemakaman')) iconSrc = 'icon/pemakaman.png';

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
    style: rthStyleFunction // Pasang fungsi style di sini
});

// --- 4. LOAD DATA DARI SUPABASE ---
async function loadRTHData() {
    try {
        const { data, error } = await supabase
            .from('Data_RTH') 
            .select('*');

        if (error) throw error;

        const features = data.map(rth => {
            // Konversi LAT LONG dari Supabase ke koordinat OpenLayers
            const lon = parseFloat(rth.LONG);
            const lat = parseFloat(rth.LAT);

            return new Feature({
                geometry: new Point(fromLonLat([lon, lat])),
                // Pastikan key ini sama dengan nama kolom di database kamu
                'Nama RTH': rth["Nama RTH"],
                'Jenis RTH': rth["Jenis RTH"],
                'Lokasi': rth.Lokasi,
                'Luas': rth.Luas
            });
        });

        rthSource.addFeatures(features);
        console.log("✅ Data Supabase berhasil dimuat");
    } catch (err) {
        console.error("❌ Gagal load database:", err.message);
    }
}

// --- 5. INITIALIZE MAP ---
const map = new Map({
    target: 'map',
    layers: [new TileLayer({ source: new OSM() }), rthLayer],
    overlays: [overlay],
    view: new View({
        center: fromLonLat([101.4478, 0.5070]),
        zoom: 12, 
    })
});

// --- 6. EVENT LISTENER FILTER (CHECKBOX) ---
document.querySelectorAll('.filter-rth').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        rthLayer.changed(); // Gambar ulang layer saat checkbox berubah
        overlay.setPosition(undefined); // Tutup popup saat filter berubah
    });
});

// --- 7. EVENT CLICK POPUP ---
map.on('singleclick', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (!feature) {
        overlay.setPosition(undefined);
        return;
    }
    
    content_element.innerHTML = `
        <h6 style="margin:0; color:#2e7d32;">🌳 ${feature.get('Nama RTH')}</h6>
        <p style="font-size:12px; margin:5px 0;"><b>Jenis:</b> ${feature.get('Jenis RTH')}</p>
        <p style="font-size:12px; margin:0;"><b>Lokasi:</b> ${feature.get('Lokasi')}</p>
        <p style="font-size:12px; margin:0;"><b>Luas:</b> ${feature.get('Luas')} m²</p>
    `;
    overlay.setPosition(evt.coordinate);
});

loadRTHData();