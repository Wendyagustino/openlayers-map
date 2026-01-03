import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktwgbtyjnbvcwdnefyj.supabase.co';
const supabaseKey = 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX';
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('rth-card-container');

async function fetchRTHData() {
    try {
        const { data, error } = await supabase
            .from('Data_RTH')
            .select('*')
            .order('No', { ascending: false });

        if (error) throw error;
        renderCards(data);
    } catch (err) {
        console.error("Gagal memuat data:", err.message);
        container.innerHTML = `<p>Error memuat data: ${err.message}</p>`;
    }
}

function renderCards(dataList) {
    if (dataList.length === 0) {
        container.innerHTML = "<p>Tidak ada data RTH.</p>";
        return;
    }

    container.innerHTML = dataList.map(item => {
        // Logika untuk membersihkan teks: "Lengkap (Kursi, Lampu)" menjadi "Lengkap"
        const fasilitasRaw = item["Kategori Kelengkapan Fasilitas"] || 'Tidak ada data';
        const fasilitasClean = fasilitasRaw.split('(')[0].trim();

        return `
        <div class="rth-card">
            <div class="card-header-title">
                <h3>${item["Nama RTH"] || 'Tanpa Nama'}</h3>
                <span class="badge-jenis">${item["Jenis RTH"] || '-'}</span>
            </div>
            
            <div class="card-content">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Pemilik:</span>
                        <span class="value">${item["Pemilik"] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Luas:</span>
                        <span class="value">${item["Luas"] || '0'} m²</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Vegetasi:</span>
                        <span class="value">${item["Jenis Vegetasi"] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Pengunjung:</span>
                        <span class="value">${item["Rata-rata Pengunjung per Hari"] || '0'} /hr</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Kebersihan:</span>
                        <span class="value">${item["Kondisi Kebersihan"] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Koordinat:</span>
                        <span class="value">${item["LAT"]}, ${item["LONG"]}</span>
                    </div>
                </div>

                <div class="info-full">
                    <span class="label">Status Fasilitas:</span>
                    <span class="value">${fasilitasClean}</span>
                </div>
                
                <div class="info-full">
                    <span class="label">Lokasi:</span>
                    <span class="value">${item["Lokasi"] || '-'}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn-action edit" title="Edit Data" onclick="window.location.href='edit.html?id=${item.No}'">
                    <i class="fas fa-pencil-alt"></i> EDIT
                </button>
                <button class="btn-action delete" title="Hapus Data" onclick="hapusRTH('${item.No}')">
                    <i class="fas fa-trash"></i> HAPUS
                </button>
            </div>
        </div>
        `;
    }).join('');
}

window.hapusRTH = async (no) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) {
        const { error } = await supabase.from('Data_RTH').delete().eq('No', no);
        if (error) alert("Gagal: " + error.message);
        else { alert("Data berhasil dihapus!"); fetchRTHData(); }
    }
};

fetchRTHData();