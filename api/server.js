const express = require('express'),
	bodyParser = require('body-parser'),
	mongodb = require('mongodb'),
	objectId = require('mongodb').ObjectId,
	multiparty= require('connect-multiparty'),
	fs = require('fs')
	

const app = express();

//mid
app.use(bodyParser.urlencoded({ extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

app.use((req, res, next) => {

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "content-type");
	res.setHeader("Access-Control-Allow-Credentials", true);

	next()
})

const port = 3001;

app.listen(port);

const db = new mongodb.Db(
	'instagram',
	new mongodb.Server('localhost', 27017, {}),
	{}
);

console.log('Servidor HTTP esta escutando na porta ' + port);

app.get('/', (req, res) => {

	res.send({msg:'Olá'});
});

//POST (create)
app.post('/api', (req, res) => {

	const date = new Date();
	const timeStamp = date.getTime();

	let dados = req.body;

	const urlImg = timeStamp + "_" +  req.files.file.originalFilename;

	const originPath = req.files.file.path;
	const destinyPath = './uploads/' + urlImg;


	dados = {
		...dados,
		imgInsta: urlImg,
	}

	fs.rename(originPath, destinyPath, (err) => {
		if (err) {
			res.status(500).json({error: err});
			return;
		}

		db.open( (err, mongoclient) => {
			mongoclient.collection('posts', (err, collection) => {
				collection.insert(dados, (err, records)  => {
					if(err){
						res.json({'status' : 'erro'});
					} else {
						res.json({'status' : 'inclusao realizada com sucesso'});
					}
					mongoclient.close();
				});
			});
		});
	})

});


//GET (ready)
app.get('/api', (req, res) => {

	db.open( (err, mongoclient) => {
		mongoclient.collection('posts', (err, collection) => {
			collection.find().toArray((err, results) => {
				if(err){
					res.json(err);
				} else {
					res.json(results);
				}
				mongoclient.close();
			});
		});
	});

});


//GET by ID (ready)
app.get('/api/:id', (req, res) => {
	db.open( (err, mongoclient) => {
		mongoclient.collection('posts', (err, collection) => {
			collection.find(objectId(req.params.id)).toArray((err, results) => {
				if(err){
					res.json(err);
				} else {
					res.status(200).json(results);
				}
				mongoclient.close();
			});
		});
	});

});

//GET IMAGE 
app.get('/images/:image', (req, res) => {
	const img = req.params.image;

	fs.readFile('./uploads/'+img, (err, content) => {
		if(err) {
			res.status(404).json(err)
			return;
		}

		res.writeHead(200, {"content-type": "image/jpg"})
		res.end(content);
	})
});


//PUT by ID (update)
app.put('/api/:id', (req, res) => {
	db.open( (err, mongoclient) => {
		mongoclient.collection('posts', (err, collection) => {
			collection.update(
				{ _id : objectId(req.params.id) },
				{ $push : { 
					comentarios : {
						id_comentario: new objectId(),
						comentario: req.body.comentario
						}
					},
				},
				{},
				(err, records) => {
					if(err){
						res.json(err);
					} else {
						res.json(records);
					}

					mongoclient.close();
				}
			);
		});
	}); 
});


//DELETE by ID (remover)
app.delete('/api/:id', function(req, res){

	db.open( function(err, mongoclient){
		mongoclient.collection('posts', function(err, collection){
			collection.update(
				{ }, 
				{ $pull : 	{
								comentarios: { id_comentario : objectId(req.params.id)}
							}
				},
				{multi: true},
				function(err, records){
					if(err){
						res.json(err);
					} else {
						res.json(records);
					}

					mongoclient.close();
				}
			);
		});
	});

});