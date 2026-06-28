const express = require('express');
const app = express();
const fs = require('fs');

const hbs = require('express-handlebars').create({
    extname: '.hbs',
    helpers: {
        cancel: function () {
            return '<a href="/"> <button> Отказаться </button> </a>';
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('port',3000);

function readDB(){
    return JSON.parse(fs.readFileSync('./db/data.json'));
}

function writeDB(data){
    fs.writeFileSync('./db/data.json', JSON.stringify(data,null,2));
}

app.get('/', (req,res)=>{

    const records = readDB();

    res.render('form',{
        records:records
    });
});

app.get('/Add',(req,res)=>{

    const records = readDB();

    res.render('add',{
        records:records
    });
});

app.post('/Add',(req,res)=>{

    const records = readDB();

    records.push({
        name:req.body.name,
        number:req.body.number
    });

    writeDB(records);

    res.redirect('/');
});

app.get('/Update',(req,res)=>{

    const id = req.query.id;

    const records = readDB();

    res.render('update',{
        records:records,
        record:records[id],
        id:id
    });
});

app.post('/Update',(req,res)=>{

    const records = readDB();

    const id = req.body.id;

    records[id].name = req.body.name;
    records[id].number = req.body.number;

    writeDB(records);

    res.redirect('/');
});

app.post('/Delete',(req,res)=>{

    const records = readDB();

    const id = req.body.id;

    records.splice(id,1);

    writeDB(records);

    res.redirect('/');
});

app.listen(app.get('port'),()=>{
    console.log(`server start http://localhost:${app.get('port')}`);
});