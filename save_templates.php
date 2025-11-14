<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!$data || !isset($data['templates'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid data: templates array required'
    ]);
    exit;
}

// Validate templates array
if (!is_array($data['templates'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Templates must be an array'
    ]);
    exit;
}

// Prepare output
$output = [
    'templates' => $data['templates']
];

// Save to file
$result = file_put_contents(
    'data/templates.json',
    json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Response
if ($result !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Templates saved successfully',
        'count' => count($data['templates'])
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to write templates file'
    ]);
}
?>
