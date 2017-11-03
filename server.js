const express = require('express');
const bodyParser= require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();


mongoose.Promise = global.Promise;
const accountSchema = new mongoose.Schema({
	name: 'string',	
	email: 'string',
	username: 'string',
	password: 'string'
});
const uri = "mongodb://admin:admin@ds243345.mlab.com:43345/sqta-mongodb";

const options = {
	useMongoClient: true,
	promiseLibrary: require('bluebird'),
};
const db = mongoose.createConnection(uri, options);
const Accounts = db.model('accounts', accountSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req,res)=>{
	const callback = (err,result) => {
		if(err)throw err;
		res.render('index.ejs', {accounts: result});		
	};
	Accounts.find(callback);
});


app.post('/login',(req,res)=> {
	var username = req.body.username;
	var password = req.body.password;

	Accounts.findOne({username: username, password: password},(err,user)=>{
		if(err){
			console.log(err);
			return res.status(500);
		}
		
		if(!user){
			console.log("Invalid Username or Password");
			return res.send('LOGIN FAILED');

		}
		
		return res.redirect('dashboard');
	});
});

app.post('/accounts', (req, res) => {
	const newAccount = {
		"name": req.body.name,
		"email": req.body.email,
		"username": req.body.username,
		"password": req.body.password
	};
	const callback = (err, data)=>{
		if(err)throw err;
		console.log('saved to database');
		res.redirect('/');
	};
	Accounts.create(newAccount, callback);
});

app.get('/register',(req,res)=>	{
	res.render('index.ejs');
});

app.get('/dashboard',(req,res)=>{
	console.log(req);
	const callback = (err,result) => {
		if(err)throw err;
		res.render('dashboard.ejs', {accounts: result});		
	};
	Accounts.find(callback);
})

app.put('/students', (req, res) => {
	
	const query = {
		studentid: req.body.studentid
	};
	
	const update = {
		$set: {
			firstname: req.body.firstname,
			lastname: req.body.lastname
		}
	};
	
	const options = {
		sort: {_id: -1},
		upsert: false
	};

	const callback = (err, result) => {
		if (err) return res.send(err);
		res.send(result);
	};

	Students.updateOne(query, update, options, callback);
});

app.delete('/students', (req, res) => {
	const query = {
		studentid: req.body.studentid
	};
	const callback = (err, result) => {
		if (err) return res.send(500, err);
		res.send({message: req.body.studentid + ' got deleted.'});
	};

	Students.deleteOne(query, callback);
});

app.set('port',(process.env.PORT || 3000));
app.listen(app.get('port'),()=>{
	console.log('listening on ', app.get('port'));
});
