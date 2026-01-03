<?php
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost", "root", "", "db_greenpku");

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$query = "SELECT * FROM rth_data ORDER BY id DESC"; // Sesuaikan nama tabel Anda
$result = mysqli_query($conn, $query);
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);