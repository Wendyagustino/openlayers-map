export function handleLogout() {
    localStorage.clear();
    window.location.href = "../login.html";
}

// Pasang ke window agar bisa dipanggil dari atribut onclick di HTML
window.logoutUser = () => {
    if(confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = "../login.html";
    }
};