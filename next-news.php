<?php
$config = require(__DIR__ . '/config.php');

$articleId = filter_var($_GET['articleId'], FILTER_SANITIZE_STRING);

$requestUrl = $config['newsApi'] . '/completed/' . urlencode($articleId);
$news = file_get_contents($requestUrl);
if (empty($news) === true) {
    $news = json_encode([
        'title' => 'Some nice title for a recommeded article',
        'description' => 'some nice description',
        'language' => 'en',
        'text' => 'full long article',
    ]);
}

header('Content-Type: application/json');
echo $news;