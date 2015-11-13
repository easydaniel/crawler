
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


var prompt = require('prompt');


// Start the prompt 
prompt.start();

prompt.get(['Keyword'], function (err, result) {

    console.log('  Keyword: ' + result.Keyword);

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
            require('fs').readFile('scraped', 'utf8', function(err, data) {
                news = JSON.parse(data);
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
    });
});

