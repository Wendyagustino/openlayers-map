<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dataset Admin | GREENPKU</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="halaman.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <style>
        /* CSS Tambahan untuk Penyelarasan */
        .dataset-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            flex-wrap: wrap;
            gap: 20px;
        }

        .stats-summary {
            display: flex;
            align-items: center;
            gap: 25px;
        }

        .stat-group {
            display: flex;
            flex-direction: column;
        }

        .stat-group .label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .stat-group .value {
            font-size: 20px;
            font-weight: 800;
            color: #2d5a27;
        }

        .stat-divider {
            width: 1px;
            height: 35px;
            background: #eee;
        }

        .search-box-admin {
            position: relative;
            width: 300px;
        }

        .search-box-admin input {
            width: 100%;
            padding: 12px 40px 12px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            outline: none;
        }

        .search-box-admin i {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #aaa;
        }
    </style>

    <script>
        // PROTEKSI: Cek login di awal
        if (localStorage.getItem('admin_logged_in') !== 'true') {
            window.location.href = "login.html"; 
        }
    </script>
</head>
<body class="admin-page">

    <aside class="admin-sidebar">
        <div class="admin-profile">
            <div class="avatar-placeholder"><i class="fas fa-user-shield"></i></div>
            <h3 id="admin-name-display">Admin</h3>
        </div>
        <nav class="admin-menu">
            <a href="list.php" class="active"><i class="fas fa-database"></i> Dataset</a>
        </nav>
        <div class="logout-section">
            <a href="#" id="logout-btn" class="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </aside>

    <main class="main-content">
        <div class="breadcrumb">Home / <b>Dataset</b></div>

        <div class="dataset-controls">
            <div class="stats-summary">
                <div class="stat-group">
                    <span class="label">Total RTH</span>
                    <span class="value" id="stat-total">0</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-group">
                    <span class="label">Taman</span>
                    <span class="value" id="stat-taman">0</span>
                </div>
                <div class="stat-group">
                    <span class="label">Jalur Hijau</span>
                    <span class="value" id="stat-jalur">0</span>
                </div>
                <div class="stat-group">
                    <span class="label">Hutan</span>
                    <span class="value" id="stat-hutan">0</span>
                </div>
                <div class="stat-group">
                    <span class="label">Kebun Bibit</span>
                    <span class="value" id="stat-bibit">0</span>
                </div>
            </div>

            <div class="control-right">
                <div class="search-box-admin">
                    <input type="text" id="search-input" placeholder="Cari Nama RTH...">
                    <i class="fas fa-search"></i>
                </div>
            </div>
        </div>

        <section class="admin-grid" id="dataset-container">
            <p>Memuat dataset...</p>
        </section>

        <div class="admin-footer">
            <div class="pagination" id="pagination-container"></div>
            <button class="add-btn-yellow" onclick="window.location.href='input.html'">Tambah Dataset</button>
        </div>
    </main>

    <script type="module" src="list.js"></script>

    <script>
        document.getElementById('admin-name-display').innerText = localStorage.getItem('nama_admin') || 'Admin';

        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm("Yakin ingin logout?")) {
                localStorage.clear(); 
                window.location.href = "login.html";
            }
        });
    </script>
</body>
</html>