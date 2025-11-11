<?php
header('Content-Type: application/json');

$filename = 'data/ppm-boards.json';
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
   "boards": [
     {
       "id": "board-xxxxx",
       "name": "Board Name",
       "description": "...",
       "sourceControlId": "cat-xxxxx",
       "sourceFlowId": "flow-xxxxx",
       "createdAt": "ISO date",
       "createdBy": "user-xxxxx",
       "archived": false,
       "members": [...],
       "columns": [...],
       "cards": [...],
       "labels": [...],
       "settings": {...},
       "activity": [...]
     }
   ]
 }
*/

$pretty_json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($filename, $pretty_json) !== false) {
    echo json_encode(['status' => 'success', 'message' => 'Board data saved successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save board data. Check file permissions on the server.']);
}
?>
