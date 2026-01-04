// Fungsi untuk memuat komponen HTML (Header/Footer)
function loadComponent(id, path, callback) {
    fetch(path)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(err => console.error("Gagal memuat komponen:", err));
}

// Eksekusi pemuatan komponen
document.addEventListener("DOMContentLoaded", () => {
    
    // Load Header dan jalankan logika Active Menu setelahnya
    loadComponent("header-container", "components/header.html", () => {
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = document.querySelectorAll(".nav-menu a");

        navLinks.forEach(link => {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            }
        });
    });

    // Load Footer
    loadComponent("footer-container", "components/footer.html");
});