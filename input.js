import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 1. Inisialisasi Supabase
const supabase = createClient('https://jktwgbtyjnbvcwdnefyj.supabase.co', 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX');

// Cek apakah admin sudah login. Jika tidak, lempar ke login.html
if (!localStorage.getItem('nama_admin')) {
    alert("Akses Ditolak! Silahkan login terlebih dahulu.");
    window.location.href = 'login.html';
}

// ==========================================
// FITUR: TAMPILKAN NAMA ADMIN & LOGOUT
// ==========================================
function setupAdminSession() {
    const namaAdmin = localStorage.getItem('nama_admin') || 'Administrator';
    const displayElement = document.getElementById('admin-name-display');
    if (displayElement) displayElement.innerText = namaAdmin;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if(confirm("Apakah Anda yakin ingin logout?")) {
                localStorage.clear();
                window.location.href = "login.html";
            }
        };
    }
}

setupAdminSession();

// ==========================================
// FITUR: SIMPAN DATA DENGAN NOMOR RANDOM
// ==========================================
const form = document.getElementById('rth-form');
const btnSimpan = document.getElementById('btn-simpan');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    btnSimpan.innerText = "⏳ Sedang Menyimpan...";
    btnSimpan.disabled = true;

    // A. Hitung jumlah fasilitas
    const jumlahTercentang = document.querySelectorAll('input[name="fasilitas_item"]:checked').length;
    let statusFasilitas = "Kurang"; 
    if (jumlahTercentang === 2) statusFasilitas = "Cukup";
    if (jumlahTercentang === 3) statusFasilitas = "Lengkap";

    // B. Buat Angka Random untuk kolom "No"
    // Menghasilkan angka 6 digit random (Contoh: 827361)
    const randomNo = Math.floor(100000 + Math.random() * 900000);

    // C. Kumpulkan Data
    const formData = {
        "No": randomNo, // MASUKKAN ANGKA RANDOM KE SINI
        "Nama RTH": document.getElementById('nama_rth').value,
        "Jenis RTH": document.getElementById('jenis_rth').value,
        "Pemilik": document.getElementById('pemilik').value,
        "Luas": parseFloat(document.getElementById('luas').value) || 0,
        "Lokasi": document.getElementById('lokasi').value, 
        "LAT": parseFloat(document.getElementById('lat').value),
        "LONG": parseFloat(document.getElementById('long').value),
        "Rata-rata Pengunjung": parseInt(document.getElementById('pengunjung').value) || 0,
        "Tingkat Kebersihan": document.getElementById('kebersihan').value,
        "Jenis Vegetasi": document.getElementById('vegetasi').value,
        "Fasilitas RTH": statusFasilitas
    };

    try {
        const { data, error } = await supabase
            .from('Data_RTH')
            .insert([formData]);

        if (error) throw error;

        alert(`✅ Sukses! Data disimpan dengan ID: ${randomNo}`);
        window.location.href = 'list.php';

    } catch (err) {
        alert("❌ Gagal Simpan: " + err.message);
        console.error("Error Detail:", err);
    } finally {
        btnSimpan.innerText = "SIMPAN DATA RTH";
        btnSimpan.disabled = false;
    }
});