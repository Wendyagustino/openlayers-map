import { createClient } from '@supabase/supabase-js';

// --- 1. KONFIGURASI SUPABASE ---
// Gunakan URL dan Key proyek kamu
const supabaseUrl = 'https://jktwgbtyjnbvcwdnefyj.supabase.co';
const supabaseKey = 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ambil elemen-elemen dari DOM
const form = document.getElementById('rth-form');
const checkboxes = document.querySelectorAll('.fasilitas-checkbox');
const statusInput = document.getElementById('fasilitas_status');

// --- 2. LOGIKA OTOMATISASI KATEGORI FASILITAS ---
// Fungsi ini akan menghitung jumlah centang dan menentukan status (Kurang, Cukup, Lengkap)
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const checkedItems = document.querySelectorAll('.fasilitas-checkbox:checked');
        const totalChecked = checkedItems.length;
        
        let status = "";
        if (totalChecked === 1) status = "Kurang";
        else if (totalChecked === 2) status = "Cukup";
        else if (totalChecked >= 3) status = "Lengkap";
        
        // Update nilai di input kategori fasilitas (readonly)
        statusInput.value = status;
    });
});

// --- 3. LOGIKA SIMPAN DATA KE SUPABASE ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Mengambil item fasilitas yang dicentang untuk detail teks
    const items = Array.from(document.querySelectorAll('.fasilitas-checkbox:checked'))
                       .map(cb => cb.value)
                       .join(', ');

    // Menggabungkan Status dan Detail (Contoh: "Lengkap (Tempat Duduk, Penerangan)")
    const statusTerpilih = statusInput.value;
    const kelengkapanFasilitas = items ? `${statusTerpilih} (${items})` : statusTerpilih;

    // GENERATE NOMOR OTOMATIS (Mencegah Error NOT NULL Constraint)
    // Menggunakan timestamp detik saat ini agar angka unik dan tidak null
    const autoNo = Math.floor(Date.now() / 1000);

    // Memetakan input form ke struktur kolom database "Data_RTH"
    const inputData = {
        "No": autoNo, 
        "Nama RTH": document.getElementById('nama_rth').value,
        "Jenis RTH": document.getElementById('jenis_rth').value,
        "Pemilik": document.getElementById('pemilik').value,
        "Lokasi": document.getElementById('lokasi').value,
        "LAT": parseFloat(document.getElementById('lat').value),
        "LONG": parseFloat(document.getElementById('long').value),
        "Luas": parseFloat(document.getElementById('luas').value) || 0,
        "Jenis Vegetasi": document.getElementById('vegetasi').value,
        "Kondisi Kebersihan": document.getElementById('kebersihan').value,
        "Kategori Kelengkapan Fasilitas": kelengkapanFasilitas,
        "Rata-rata Pengunjung per Hari": parseInt(document.getElementById('pengunjung').value) || 0
    };

    try {
        // Proses pengiriman data ke tabel "Data_RTH" di Supabase
        const { data, error } = await supabase
            .from('Data_RTH')
            .insert([inputData]);

        if (error) throw error;

        // Jika berhasil
        alert("✅ Data RTH Berhasil Tersimpan!");
        form.reset(); // Reset isi form
        statusInput.value = ""; // Reset input status otomatis
        
    } catch (err) {
        // Menampilkan pesan error jika gagal (seperti null constraint atau koneksi)
        alert("❌ Gagal menyimpan: " + err.message);
        console.error("Detail Error:", err);
    }
});