import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://jktwgbtyjnbvcwdnefyj.supabase.co', 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX');

const form = document.getElementById('rth-form');
const checkboxes = document.querySelectorAll('.fasilitas-checkbox');
const statusLabel = document.getElementById('status-label');
const adminDisplay = document.getElementById('admin-name-display');

// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');

// Cek apakah admin sudah login. Jika tidak, lempar ke login.html
if (!localStorage.getItem('nama_admin')) {
    alert("Akses Ditolak! Silahkan login terlebih dahulu.");
    window.location.href = 'login.html';
}

// Tampilkan Nama Admin
adminDisplay.innerText = localStorage.getItem('nama_admin') || 'Administrator';

if (!editId) {
    alert("Data tidak ditemukan!");
    window.location.href = 'list.php';
} else {
    document.getElementById('display-id').innerText = editId;
}

// 1. Fungsi Hitung Status Fasilitas Otomatis
const updateFasilitasStatus = () => {
    const checkedCount = document.querySelectorAll('.fasilitas-checkbox:checked').length;
    let status = "Kurang";
    if (checkedCount === 2) status = "Cukup";
    else if (checkedCount === 3) status = "Lengkap";
    
    statusLabel.innerText = status;
    return status;
};

checkboxes.forEach(cb => cb.addEventListener('change', updateFasilitasStatus));

// 2. Load Data Lama dari Supabase
async function loadData() {
    const { data, error } = await supabase
        .from('Data_RTH')
        .select('*')
        .eq('No', editId)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    if (data) {
        document.getElementById('nama_rth').value = data["Nama RTH"] || '';
        document.getElementById('jenis_rth').value = data["Jenis RTH"] || 'Taman Kota';
        document.getElementById('pemilik').value = data["Pemilik"] || 'Pemerintah Kota';
        document.getElementById('lat').value = data["LAT"] || '';
        document.getElementById('long').value = data["LONG"] || '';
        
        // Logika centang: jika data di DB mengandung kata-kata fasilitas
        const dbFasilitasStatus = data["Fasilitas RTH"] || "";
        // Karena di input.js sebelumnya kita simpan status (Kurang/Cukup/Lengkap), 
        // kita tidak tahu item apa saja yang dicentang sebelumnya kecuali jika Anda simpan itemnya.
        // Jika Anda hanya simpan "Lengkap", kita asumsikan centang semua.
        if(dbFasilitasStatus === "Lengkap") {
            checkboxes.forEach(cb => cb.checked = true);
        } else if (dbFasilitasStatus === "Cukup") {
            checkboxes[0].checked = true; checkboxes[1].checked = true; // Contoh 2 pertama
        }
        updateFasilitasStatus();
    }
}

loadData();

// 3. Submit Update
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-simpan');
    btn.innerText = "⏳ Memproses...";
    btn.disabled = true;

    const statusFinal = updateFasilitasStatus();

    const updatedData = {
        "Nama RTH": document.getElementById('nama_rth').value,
        "Jenis RTH": document.getElementById('jenis_rth').value,
        "Pemilik": document.getElementById('pemilik').value,
        "LAT": parseFloat(document.getElementById('lat').value),
        "LONG": parseFloat(document.getElementById('long').value),
        "Fasilitas RTH": statusFinal
    };

    const { error } = await supabase
        .from('Data_RTH')
        .update(updatedData)
        .eq('No', editId);

    if (error) {
        alert("Gagal Update: " + error.message);
        btn.disabled = false;
        btn.innerText = "PERBARUI DATA";
    } else { 
        alert("✅ Data Berhasil Diperbarui!"); 
        window.location.href = 'list.php'; 
    }
});