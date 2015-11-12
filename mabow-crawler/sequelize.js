var Sequelize = require('sequelize');
var sequelize = new Sequelize('mysql://ibabymall:ibabymallfogworkshop@220.132.97.119/ibabymall');


sequelize.query("SELECT * FROM `event`", { type: sequelize.QueryTypes.SELECT}).then(function(res) {
    console.log(res);
});
