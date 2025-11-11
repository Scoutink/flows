<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!$data || !isset($data['flows'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid data: flows object required'
    ]);
    exit;
}

// Prepare output
$output = [
    'flows' => $data['flows']
];

// Save to file
$result = file_put_contents(
    'data/executions.json',
    json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Response
if ($result !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Executions saved successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to write executions file'
    ]);
}
?>
