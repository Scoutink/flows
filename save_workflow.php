<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Ensure required structure
if (!isset($data['settings'])) {
    $data['settings'] = ['enforceSequence' => false];
}
if (!isset($data['flows'])) {
    $data['flows'] = [];
}

// Save to file
$result = file_put_contents(
    'data/workflows.json',
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Response
if ($result !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Workflows saved successfully',
        'flowCount' => count($data['flows'])
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to write workflows file'
    ]);
}
?>
