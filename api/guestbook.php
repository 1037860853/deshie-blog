<?php
/**
 * 留言板 API — 服务端存储
 * 数据文件: api/guestbook-data.json
 * 接口:
 *   GET     /api/guestbook.php          获取所有留言
 *   POST    /api/guestbook.php          新增留言 { author, text, device }
 *   DELETE  /api/guestbook.php?id=xxx   管理员删除留言（需 X-Admin-Token）
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ---- 配置 ---- */
$dataFile = __DIR__ . '/guestbook-data.json';
$adminPassword = 'qiufeng-admin-2026'; // 上线后务必修改

/* ---- 工具函数 ---- */
function loadMessages() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
        return [];
    }
    $data = json_decode(file_get_contents($dataFile), true);
    return is_array($data) ? $data : [];
}

function saveMessages($messages) {
    global $dataFile;
    file_put_contents(
        $dataFile,
        json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
}

function isAdmin() {
    global $adminPassword;
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    return $token === $adminPassword;
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return $_SERVER['HTTP_X_REAL_IP'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/* ---- 路由 ---- */
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    /* 获取所有留言 */
    case 'GET':
        $messages = loadMessages();
        echo json_encode($messages, JSON_UNESCAPED_UNICODE);
        break;

    /* 新增留言 */
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty(trim($input['author'] ?? '')) || empty(trim($input['text'] ?? ''))) {
            http_response_code(400);
            echo json_encode(['error' => '昵称和留言内容不能为空'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $messages = loadMessages();

        $msg = [
            'id'     => uniqid('m_', true),
            'author' => mb_substr(trim($input['author']), 0, 20),
            'text'   => mb_substr(trim($input['text']), 0, 500),
            'device' => $input['device'] ?? 'Unknown',
            'ip'     => getClientIP(),
            'time'   => date('Y-m-d H:i:s'),
        ];

        $messages[] = $msg;
        saveMessages($messages);

        echo json_encode($msg, JSON_UNESCAPED_UNICODE);
        break;

    /* 删除留言（管理员） */
    case 'DELETE':
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => '无权限删除'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $id = $_GET['id'] ?? '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => '缺少留言 ID'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $messages = loadMessages();
        $before = count($messages);
        $messages = array_values(array_filter($messages, function($m) use ($id) {
            return ($m['id'] ?? '') !== $id;
        }));

        if (count($messages) === $before) {
            http_response_code(404);
            echo json_encode(['error' => '留言不存在'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        saveMessages($messages);
        echo json_encode(['success' => true, 'deleted' => $id], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => '请求方法不允许'], JSON_UNESCAPED_UNICODE);
}
