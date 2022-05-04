var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb');

var app = express();

// body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 8000;

app.listen(port);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost',27017,{}),
    {}
);

console.log('Servidor HTTP esta escutando na porta ' + port);

app.get('/', function(req, res){
    res.send({msg:'Olá'});
});

// GET(ready)
app.get('/api', function(req, res){
    var dados = req.body;
    db.open(function(err, mongoclient){
        mongoclient.collection('postagens', (err, collection) =>{
            collection.find().toArray((err, result) => {
                    if(err) {
                        res.json(err)
                    } else {
                        res.json(result)
                    }
                    mongoclient.close();
            });
        });
    });
}); 

// POST(create)
app.post('/api', (req, res) =>{
    var dados = req.body;
    db.open((err, mongoclient) => {
        mongoclient.collection('postagens', (err, collection) => {
            collection.insert(dados, (err, records) => {
                if(err){
                    res.json({'status': 'erro'});
                }else{
                    res.json({'status': 'inclusao realizada com sucesso'});
                }
                mongoclient.close();
            });
        });
    });
});