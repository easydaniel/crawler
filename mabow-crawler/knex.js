var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : '140.113.194.120',
        user     : 'nctuoj',
        password : 'yavaf2droyPo',
        database : 'nctuoj'
    }
});

knex.select().from('users').then(function(res) {
});


