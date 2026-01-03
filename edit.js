import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jktwgbtyjnbvcwdnefyj.supabase.co';
const supabaseKey = 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX';
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('edit-rth-form');
const statusInput = document.getElementById('fasilitas_status');
const checkboxes = document.querySelectorAll('.fasilitas-checkbox');

// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');

if (!editId) {
    alert("Data tidak ditemukan!");
    window.location.href = 'list.html';
}

// 1. Fungsi Hitung Status Fasilitas Otomatis
const updateFasilitasStatus = () => {
    const checkedCount = document.querySelectorAll('.fasilitas-checkbox:checked').length;
    let status = "";
    if (checkedCount === 1) status = "Kurang";
    else if (checkedCount === 2) status = "Cukup";
    else if (checkedCount >= 3) status = "Lengkap";
    statusInput.value = status;
};

checkboxes.forEach(cb => cb.addEventListener('change', updateFasilitasStatus));

// 2. Load Data Lama
async function loadData() {
    const { data, error } = await supabase
        .from('Data_RTH')
        .select('*')
        .eq('No', editId)
        .single();

    if (data) {
        document.getElementById('nama_rth').value = data["Nama RTH"];
        document.getElementById('jenis_rth').value = data["Jenis RTH"];
        document.getElementById('pemilik').value = data["Pemilik"];
        document.getElementById('lat').value = data["LAT"];
        document.getElementById('long').value = data["LONG"];
        
        // Centang checkbox berdasarkan data lama
        const dbFasilitas = data["Kategori Kelengkapan Fasilitas"] || "";
        checkboxes.forEach(cb => {
            if (dbFasilitas.includes(cb.value)) cb.checked = true;
        });
        updateFasilitasStatus();
    }
}

loadData();

// 3. Submit Update
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const items = Array.from(document.querySelectorAll('.fasilitas-checkbox:checked'))
                       .map(cb => cb.value).join(', ');
    
    const finalFasilitas = items ? `${statusInput.value} (${items})` : statusInput.value;

    const updatedData = {
        "Nama RTH": document.getElementById('nama_rth').value,
        "Jenis RTH": document.getElementById('jenis_rth').value,
        "Pemilik": document.getElementById('pemilik').value,
        "LAT": parseFloat(document.getElementById('lat').value),
        "LONG": parseFloat(document.getElementById('long').value),
        "Kategori Kelengkapan Fasilitas": finalFasilitas
    };

    const { error } = await supabase.from('Data_RTH').update(updatedData).eq('No', editId);

    if (error) alert("Gagal: " + error.message);
    else { alert("Berhasil Diperbarui!"); window.location.href = 'list.html'; }
});