// app/models/employees.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmployeeSchema   = new Schema({
	picName:String,
	firstName:String,
    lastName: String,
	title:String,
	gender: String,
	age: String,
	startDate:String,
	officePhone:String,
	cellPhone:String,
	sendMessage:String,
	email:String,
	managerID:String,
	directReports:Array
});

module.exports = mongoose.model('Employee', EmployeeSchema);
