"use strict";
$(function () {
    var userId = '';
    var userContextCategory = 'important';
    var userContextArticle = null;
    var currentStatus = 'stopped';
    var voices = {
        'en': 'UK English Male',
        'de': 'Deutsch Female'
    };
    var setStatus = function (status) {
        $('#output').removeClass(currentStatus).addClass(status);
        currentStatus = status;
    };

    // setup voice recognition and commands
    if (annyang) {
        var startDemo = function () {
            setStatus('reading');
            read('Good morning. User. Here is the latest news for today', 'en', {
                onend: function () {
                    getLatestArticle();
                }
            });
        };

        var getArticleForCategory = function (category) {
            console.log('getArticleForCategory ' + category);
            userContextCategory = category;
            $.ajax({
                dataType: "json",
                url: '/next-news-for-category.php',
                data: {
                    category: category
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var getArticleForQuery = function (query) {
            console.log('getArticleForQuery ' + query);
            $.ajax({
                dataType: "json",
                url: '/next-news-for-query.php',
                data: {
                    query: query
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var getLatestArticle = function () {
            userContextCategory = 'important';
            console.log('getLatestArticle');
            $.ajax({
                dataType: "json",
                url: '/next-news-for-category.php',
                data: {
                    category: 'important'
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var skipArticle = function () {
            console.log('skipArticle');
            $.ajax({
                dataType: "json",
                url: '/skip-news.php',
                data: {
                    articleId: userContextArticle.articleId
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var moreArticle = function () {
            console.log('moreArticle');
            $.ajax({
                dataType: "json",
                url: '/more-news.php',
                data: {
                    articleId: userContextArticle.articleId
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var nextArticle = function () {
            console.log('nextArticle');
            $.ajax({
                dataType: "json",
                url: '/next-news.php',
                data: {
                    articleId: userContextArticle.articleId
                },
                success: function (article, textStatus, jqXHR) {
                    readArticle(article);
                }
            });
        };

        var endDemo = function () {
            console.log('that´s it');
            read("That's it! Thank you a lot.", 'en');
            setStatus('stopped');
        };

        var readArticle = function (article) {
            userContextArticle = article;
            setStatus('reading');
            //trackArticle(article);

            var gotoNextArticle = function () {
                nextArticle();
            };
            var readText = function () {
                read(article.text, article.language, {
                    onend: gotoNextArticle
                });
            };
            read(article.title, article.language, {
                onend: gotoNextArticle
            });
        };

        var trackArticle = function (article) {
            utag.link({
                "page_name": "alexa_test_page", // name of page
                "user_id": userId, // used as unique cross-device ID
                "string_01": "alexa great site", // stored as string in visitor profile
                "string_02": "alexa hello", // stored as string in visitor profile
                "string_03": "alexa blah", // stored as string in visitor profile
                "metric_total_01": "1", // set to value in visitor profile
                "metric_total_02": "250", // set to value in visitor profile
                "metric_add_01": "5", // will be incremented in visitor profile
                "metric_add_02": "7" // will be incremented in visitor profile
            });
        };

        var read = function (text, language, callback) {
            console.log('read: ' + language + ' / ' + text);
            var voice = voices[language];
            responsiveVoice.speak(text, voice, callback);
        };

        var commands = {
            'give me news for :category': getArticleForCategory,
            'give me news in :category': getArticleForCategory,
            'give me news about :query': getArticleForQuery,
            'give me (the latest) news': getLatestArticle,
            'skip': skipArticle,
            'skip (news)': skipArticle,
            'next': skipArticle,
            'funky': skipArticle,
            'next (news)': skipArticle,
            'more': moreArticle,
            'more (news)': moreArticle,
            "that'\s it": endDemo,
            "quit": endDemo,
            "quit (demo)": endDemo,
            'stop': endDemo,
            'stop (demo)': endDemo,
            'good bye': endDemo,
            'start': startDemo,
            'start (demo)': startDemo
        };

        // OPTIONAL: activate debug mode for detailed logging in the console
        annyang.debug();

        annyang.addCommands(commands);

        // add more debug callbacks
        annyang.addCallback('start', function () {
            console.log('engine ready!');
            setStatus('listening');
        });
        annyang.addCallback('error', function () {
            console.log('engine error!');
            setStatus('error');
        });
        annyang.addCallback('errorNetwork', function () {
            console.log('engine network error!');
            setStatus('error');
        });
        annyang.addCallback('errorPermissionBlocked', function () {
            console.log('engine error permission blocked!');
            setStatus('error');
        });
        annyang.addCallback('errorPermissionDenied', function () {
            console.log('engine error permission denied!');
            setStatus('error');
        });
        annyang.addCallback('resultMatch', function (userSaid, commandText, phrases) {
            console.log(userSaid);
            console.log(commandText);
            console.log(phrases);
        });
        annyang.addCallback('resultNoMatch', function (phrases) {
            console.log(phrases);
        });

        // OPTIONAL: Set a language for speech recognition (defaults to English)
        // For a full list of language codes, see the documentation:
        // https://github.com/TalAter/annyang/blob/master/docs/FAQ.md#what-languages-are-supported
        annyang.setLanguage('en');

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();

        //setTimeout(startDemo, 2000);
        setStatus('stopped');

        $('#output').bind('click', function () {
            if (currentStatus === 'stopped' || currentStatus === 'listening') {
                startDemo();
            } else {
                endDemo();
            }
        });
    } else {
        setStatus('error');
    }

    if (responsiveVoice.voiceSupport() === false) {
        setStatus('error');
    }
});