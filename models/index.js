'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {
    Users:require('./user'),
    Accounts:require('./account'),
    Transactions:require('./transaction'),
    Packages:require('./packages'),
    Investments:require('./investments'),
    Weeklypay:require('./weeklypay'),
    Vault:require('./vault'),
    Verification:require('./verification'),
    Admin:require('./admin'),
    SystemAc:require('./systemac'),
    DepositQuery:require('./depositQuery'),
    InterestToPay:require('./interestToPay'),
    Notifications:require('./notifications'),
    Pack:require('./pack'),
    WithdrawFunds:require('./withdrawFunds'),
    Message:require('./message'),
    Testimonia:require('./testimonia')
};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
//db.Sequelize = Sequelize;

module.exports = db;
