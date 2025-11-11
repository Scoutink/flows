<?php
header('Content-Type: application/json');

$filename = 'workflow-links.json';
$json_data = file_get_contents('php://input');

if (empty($json_data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data received.']);
    exit;
}

$data = json_decode($json_data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON format.']);
    exit;
}

/*
 Expected schema:
 {
   "links": [
     {
       "groupId": "link-xxxxx",
       "workflows": ["flow-id-1", "flow-id-2", ...]
     }
   ]
 }
*/
$pretty_json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($filename, $pretty_json) !== false) {
    echo json_encode(['status' => 'success', 'message' => 'Workflow links saved successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save workflow links. Check file permissions on the server.']);
}
?>
