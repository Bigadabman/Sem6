const { Sequelize } = require('sequelize');
const {ORM} = require('./18-01m')
const http = require('http');

const PORT = 3000;


const sequelize = new Sequelize('KEO_PDB', 'KEO', '1234', {
    dialect: 'oracle',
    host: 'localhost',
    port: 1522,

    dialectOptions: {
        connectString: 'localhost:1522/KEO_PDB',
    },

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    logging: false
});

let sendResponse = (response, p) => {
  
  response.writeHead(200, {'Content-Type':'application/json'});
  response.end(JSON.stringify(p));
}



const {Faculty, Pulpit, Teacher, Subject, Auditorium_type, Auditorium} = ORM(sequelize);



let server = http.createServer(async (request, response) => {

  try{

    if(request.method === 'GET' && request.url === '/api/faculties'){
        sendResponse(response, await Faculty.findAll());
        return;
    }

    if(request.method === 'GET' && request.url === '/api/pulpits'){
        // sendResponse(response, await Pulpit.findAll());
        sendResponse(response, await sequelize.query('select * from pulpit inner join subject on pulpit.pulpit = subject.pulpit inner join faculty on pulpit.faculty = faculty.faculty;'))
        return;
    }

    if(request.method === 'GET' && request.url === '/api/subjects'){
        sendResponse(response, await Subject.findAll());
        return;
    }

    if(request.method === 'GET' && request.url === '/api/auditoriumstypes'){
        sendResponse(response, await Auditorium_type.findAll());
        return;
    }

    if(request.method === 'GET' && request.url === '/api/auditoriums'){
        sendResponse(response, await Auditorium.findAll());
        return;
    }



    if(['POST','PUT'].includes(request.method)){
        let body='';
        request.on('data', chunk => body+=chunk);
        await new Promise(resolve => request.on('end', resolve));
        request.body = JSON.parse(body || '{}');
    }



    if(request.method==='POST' && request.url==='/api/faculties'){
        sendResponse(response, await Faculty.create(request.body));
        return;
    }

    if(request.method==='POST' && request.url==='/api/pulpits'){
        sendResponse(response, await Pulpit.create(request.body));
        return;
    }

    if(request.method==='POST' && request.url==='/api/subjects'){
        sendResponse(response, await Subject.create(request.body));
        return;
    }

    if(request.method==='POST' && request.url==='/api/auditoriumstypes'){
        sendResponse(response, await Auditorium_type.create(request.body));
        return;
    }

    if(request.method==='POST' && request.url==='/api/auditoriums'){
        sendResponse(response, await Auditorium.create(request.body));
        return;
    }



    if(request.method==='PUT' && request.url==='/api/faculties'){
        await Faculty.update(request.body,{where:{FACULTY:request.body.FACULTY}});
        sendResponse(response, await Faculty.findByPk(request.body.FACULTY));
        return;
    }

    if(request.method==='PUT' && request.url==='/api/pulpits'){
        await Pulpit.update(request.body,{where:{PULPIT:request.body.PULPIT}});
        sendResponse(response, await Pulpit.findByPk(request.body.PULPIT));
        return;
    }

    if(request.method==='PUT' && request.url==='/api/subjects'){
        await Subject.update(request.body,{where:{SUBJECT:request.body.SUBJECT}});
        sendResponse(response, await Subject.findByPk(request.body.SUBJECT));
        return;
    }

    if(request.method==='PUT' && request.url==='/api/auditoriumstypes'){
        await Auditorium_type.update(request.body,{
            where:{AUDITORIUM_TYPE:request.body.AUDITORIUM_TYPE}
        });
        sendResponse(response,
            await Auditorium_type.findByPk(request.body.AUDITORIUM_TYPE)
        );
        return;
    }

    if(request.method==='PUT' && request.url==='/api/auditoriums'){
        await Auditorium.update(request.body,{
            where:{AUDITORIUM:request.body.AUDITORIUM}
        });
        sendResponse(response,
            await Auditorium.findByPk(request.body.AUDITORIUM)
        );
        return;
    }


    if(request.method==='DELETE' && request.url.startsWith('/api/faculties/')){
        const id = decodeURIComponent(request.url.split('/')[3]);
        const obj = await Faculty.findByPk(id);
        await Faculty.destroy({where:{FACULTY:id}});
        sendResponse(response,obj);
        return;
    }

    if(request.method==='DELETE' && request.url.startsWith('/api/pulpits/')){
        const id = decodeURIComponent(request.url.split('/')[3]);
        const obj = await Pulpit.findByPk(id);
        await Pulpit.destroy({where:{PULPIT:id}});
        sendResponse(response,obj);
        return;
    }

    if(request.method==='DELETE' && request.url.startsWith('/api/subjects/')){
        const id = decodeURIComponent(request.url.split('/')[3]);
        const obj = await Subject.findByPk(id);
        await Subject.destroy({where:{SUBJECT:id}});
        sendResponse(response,obj);
        return;
    }

    if(request.method==='DELETE' && request.url.startsWith('/api/auditoriumtypes/')){
        const id = decodeURIComponent(request.url.split('/')[3]);
        const obj = await Auditorium_type.findByPk(id);
        await Auditorium_type.destroy({where:{AUDITORIUM_TYPE:id}});
        sendResponse(response,obj);
        return;
    }

    if(request.method==='DELETE' && request.url.startsWith('/api/auditoriums/')){
        const id = decodeURIComponent(request.url.split('/')[3]);
        const obj = await Auditorium.findByPk(id);
        await Auditorium.destroy({where:{AUDITORIUM:id}});
        sendResponse(response,obj);
        return;
    }

    response.writeHead(404);
    response.end();

  }
  catch(e){
      response.writeHead(500,{'Content-Type':'application/json'});
      response.end(JSON.stringify({error:e.message}));
  }
});


sequelize.authenticate()
.then(()=>{
  console.log('connected'); 
  server.listen(PORT, () =>{
    console.log(`Server running at http://localhost:${PORT}`);
})
})
.catch((e) => {
  console.log(e)
})

