<?php
$config = require(__DIR__ . '/config.php');

$query = filter_var($_GET['query'], FILTER_SANITIZE_STRING);

$requestUrl = $config['newsApi'] . '/search?' . http_build_query(['query' => $query]);
$news = file_get_contents($requestUrl);
if (empty($news) === true) {
    $news = json_encode([
        'title' => 'Some nice title for ' . $_GET['category'],
        'description' => 'some nice description',
        'text' => 'full long article',
    ]);
}

header('Content-Type: application/json');
echo $news;