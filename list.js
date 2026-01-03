import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 1. Konfigurasi Supabase (GANTI DENGAN PUNYA ANDA)
const supabase = createClient('https://jktwgbtyjnbvcwdnefyj.supabase.co', 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX');

const container = document.getElementById('dataset-container');
const searchInput = document.getElementById('search-input');
const paginationContainer = document.getElementById('pagination-container');

let allData = [];
let currentPage = 1;
const itemsPerPage = 6;

// 2. Fungsi Ambil Data & Update Statistik
async function fetchRTHData() {
    container.innerHTML = '<div class="loading">Memuat data...</div>';
    
    const { data, error } = await supabase
        .from('Data_RTH')
        .select('*')
        .order('No', { ascending: false });

    if (error) {
        console.error("Error:", error);
        container.innerHTML = `<p>Gagal memuat data.</p>`;
        return;
    }

    allData = data;
    renderUI();
    updateCounterStats(); // Panggil penghitung otomatis
}

// 3. Fungsi Penghitung Statis (Berdasarkan Kategori)
async function updateCounterStats() {
    // Total Keseluruhan
    document.getElementById('stat-total').innerText = allData.length;

    // Hitung per Kategori dari array allData (lebih cepat daripada fetch ulang)
    const countBy = (val) => allData.filter(item => item["Jenis RTH"] === val).length;

    document.getElementById('stat-taman').innerText = countBy('Taman Kota');
    document.getElementById('stat-jalur').innerText = countBy('Jalur Hijau Di Jalan');
    document.getElementById('stat-hutan').innerText = countBy('Hutan Kota');
    document.getElementById('stat-bibit').innerText = countBy('Kebun Bibit');
}

// 4. Render Card
function renderUI() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allData.filter(item => 
        (item["Nama RTH"] || "").toLowerCase().includes(keyword)
    );
    
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    if (paginated.length === 0) {
        container.innerHTML = '<p>Data tidak ditemukan.</p>';
        return;
    }

    container.innerHTML = paginated.map(item => `
        <div class="admin-card">
            <div class="card-tag">ID: ${item.No}</div>
            <div class="card-body">
                <div class="info-row"><span>Nama RTH</span><b>${item["Nama RTH"] || '-'}</b></div>
                <div class="info-row"><span>Jenis:</span><b>${item["Jenis RTH"] || '-'}</b></div>
                <div class="info-row"><span>Koordinat:</span><b>${item["LAT"]}, ${item["LONG"]}</b></div>
            </div>
            <div class="card-btns">
                <button class="edit-btn" onclick="window.location.href='edit.html?id=${item.No}'">EDIT</button>
                <button class="delete-btn" onclick="window.hapusRTH('${item.No}')">HAPUS</button>
            </div>
        </div>
    `).join('');

    renderPagination(filtered.length);
}

// 5. Pagination & Delete (Global)
function renderPagination(total) {
    const pages = Math.ceil(total / itemsPerPage);
    let html = '';
    for (let i = 1; i <= pages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
    }
    paginationContainer.innerHTML = html;
}

window.changePage = (p) => { currentPage = p; renderUI(); };

window.hapusRTH = async (no) => {
    if (confirm("Hapus data ini?")) {
        const { error } = await supabase.from('Data_RTH').delete().eq('No', no);
        if (!error) fetchRTHData();
    }
};

// Event Pencarian
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderUI();
});

// Jalankan saat pertama kali
fetchRTHData();