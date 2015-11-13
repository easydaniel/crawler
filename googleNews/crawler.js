var Nightmare = require('nightmare');
var fs = require('fs');
var vo = require('vo');
var sleep = require('sleep');

// schema = {
//  title: title,
//  url: url,
//  date: date,
//  publish: publish,
//  description: description
//  }

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : '220.132.97.119',
        port     : '13306',
        user     : 'ibabymall',
        password : 'ibabymallfogworkshop',
        database : 'ibabymall'
    },
    pool: {
        min: 0,
        max: 7
    }
});



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

    if (!process.env.KEYWORD) {
        console.log('請輸入關鍵字 KEYWORD=<keyword> node crawler.js');
        yield nightmare.end();
        process.exit();
    } else {
        console.log('關鍵字',process.env.KEYWORD);
        var news = yield nightmare
            .type('#gbqfq',process.env.KEYWORD)
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
        var requests = 2;
        while(page && requests--) {
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

        knex.schema.dropTable('News').then(function() {
            knex.schema.createTable('News', function (table) {
                table.increments();
                table.string('title');
                table.string('date');
                table.string('url', 511);
                table.string('description', 511);
                table.string('publish');
                table.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
            }).then(function() {
                for (var index in news) {
                    //console.log(index);
                    knex.insert(news[index]).into('News').then(function(res) {
                        var id = JSON.parse(res);
                        console.log('insert into ', id);
                        if (id === news.length) {
                            console.log('Insertion done');
                            knex.destroy();
                        }
                    });
                }
            });
        });

        fs.writeFile('scraped', JSON.stringify(news), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log(' Data saved to scraped '); 
        });    
        yield nightmare.end();
    }
}
