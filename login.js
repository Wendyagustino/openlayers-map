import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://jktwgbtyjnbvcwdnefyj.supabase.co', 'sb_publishable_AlRh16zgfbvV5swBtDKVrw_HuQeiCtX');

async function handleLogin() {
    const namaInput = document.getElementById('admin_name').value;
    const passwordInput = document.getElementById('admin_password').value;
    const errorMsg = document.getElementById('error-msg');
    const btn = document.getElementById('btnLogin');

    btn.innerText = "Memproses...";
    btn.disabled = true;

    try {
        // Gunakan .maybeSingle() agar tidak error jika data tidak ditemukan
        const { data, error, status } = await supabase
            .from('admin')
            .select('*')
            .eq('nama', namaInput)
            .eq('password', passwordInput)
            .maybeSingle();

        if (error) {
            console.error("Supabase Error:", error);
            throw new Error(error.message);
        }

        if (data) {
            // Berhasil Login
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('nama_admin', data.nama);
            window.location.href = "list.php";
        } else {
            // Data kosong (Nama/Password salah)
            errorMsg.innerText = "Nama atau Password salah!";
            errorMsg.style.display = "block";
            btn.innerText = "Login";
            btn.disabled = false;
        }
    } catch (err) {
        console.error("System Error:", err);
        alert("Gagal terhubung ke database. Pastikan RLS Policy sudah di-set ke 'Enable Read'.");
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

window.handleLogin = handleLogin;