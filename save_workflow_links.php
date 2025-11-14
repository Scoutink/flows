<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!$data || !isset($data['links'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid data: links array required'
    ]);
    exit;
}

// Prepare output
$output = [
    'links' => $data['links']
];

// Save to file
$result = file_put_contents(
    'data/workflow-links.json',
    json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Response
if ($result !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Workflow links saved successfully',
        'linkCount' => count($data['links'])
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to write workflow links file'
    ]);
}
?>
