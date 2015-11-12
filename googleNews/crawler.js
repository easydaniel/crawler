var Nightmare = require('nightmare');
var fs = require('fs');
var vo = require('vo');
var sleep = require('sleep');

vo(run)(function(err, result) {
    if (err) throw err;
});

function *run() {
    var url = 'https://news.google.com.tw/nwshp?hl=zh-TW&tab=wn';
    var nightmare = Nightmare();
    yield nightmare.goto(url);

    var nowUrl = yield nightmare.url();
    var nowTitle = yield nightmare.title();
    console.log('Url: ', nowUrl);
    console.log('Title: ', nowTitle);

    var news = yield nightmare
        .type('#gbqfq','麗嬰房')
        .click('#gbqfb')
        .wait('#ires')
        .screenshot('Search.png')
        .evaluate(function() {
            var res = [];
            var post = document.querySelectorAll('.g');
            for (var index = 0; index < post.length; index++) {
                var title = post.item(index).querySelector('.l._HId').innerText;
                var date = post.item(index).querySelector('.f.nsa._uQb').innerText;
                var publish = post.item(index).querySelector('._tQb._IId').innerText;
                var url = post.item(index).querySelector('.l._HId').href;
                var description = post.item(index).querySelector('.st').innerText;
                var obj = {
                    title: title,
                    date: date,
                    publish: publish,
                    url: url,
                    description: description
                }
                res.push(obj);
            }
            return res;
        });
    var page = yield nightmare.exists('#pnnext');
    while(page) {
        var nowUrl = yield nightmare.url();
        var nowTitle = yield nightmare.title();
        console.log('Url: ', nowUrl);
        console.log('Title: ', nowTitle);
        var next = yield nightmare
            .click('#pnnext')
            .wait('#ires')
            .evaluate(function() {
                var res = [];
                var post = document.querySelectorAll('.g');
                for (var index = 0; index < post.length; index++) {
                    var title = post.item(index).querySelector('.l._HId').innerText;
                    var date = post.item(index).querySelector('.f.nsa._uQb').innerText;
                    var publish = post.item(index).querySelector('._tQb._IId').innerText;
                    var url = post.item(index).querySelector('.l._HId').href;
                    var description = post.item(index).querySelector('.st').innerText;
                    var obj = {
                        title: title,
                        date: date,
                        publish: publish,
                        url: url,
                        description: description
                    }
                    res.push(obj);
                }
                return res;
            });
        //console.log(next);
        news.push.apply(news,next);
        page = yield nightmare.exists('#pnnext');
    }
    //console.log(news);
    fs.writeFile('scraped', JSON.stringify(news), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('------------ Data saved to scraped -----------'); 
    });    
    yield nightmare.end();
}
