<?php
session_start();
header('Content-Type: application/json');

// Koneksi ke Database
$conn = mysqli_connect("localhost", "root", "", "db_greenpku");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Gagal koneksi database']);
    exit;
}

// Ambil data JSON dari fetch
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['nama']) && isset($data['password'])) {
    $nama = mysqli_real_escape_string($conn, $data['nama']);
    $pass = $data['password'];

    $query = "SELECT * FROM admin WHERE nama = '$nama'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        
        // Cek password teks biasa
        if ($pass == $row['password']) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['nama_admin'] = $row['nama'];
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Password salah!']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Admin tidak ditemukan!']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
}
mysqli_close($conn);
?>