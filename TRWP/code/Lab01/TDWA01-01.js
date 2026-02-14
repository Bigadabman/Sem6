const http = require('http');
const url = require('url');

const PORT = 40000;

let storedJSON = null;

let sendError = (response, code, message) => {
    response.writeHead(code, {'content-type':'text/html'});
    response.end(`<h2>${code}, ${message}</h2>`);
}

let sendResult = (response, data) => {
    response.writeHead(200, {'content-type':'application/json'});
    response.end(JSON.stringify(data));
}

let calc = (op, x, y) => {
    switch(op){
        case 'add': return x+y;
        case 'sub': return x-y;
        case 'mul': return x*y;
        case 'div': return y!==0 ? x/y : null;
        default: return null;
    }
}

const httpHandler = http.createServer((request, response) => {

    let method = request.method;
    let pathname = url.parse(request.url).pathname;

    if(pathname !== '/NGINX-test')
        return sendError(response,404,'Not found');

    let body = '';

    request.on('data', chunk => body += chunk.toString());

    request.on('end', ()=>{

        let json;

        switch(method){

            case 'GET':
                if(!storedJSON)
                    return sendError(response,404,'JSON not found');

                return sendResult(response, storedJSON);

            case 'POST':

                if(storedJSON)
                    return sendError(response,409,'JSON exists');

                if(!body)
                    return sendError(response,400,'No body');

                json = JSON.parse(body);

                storedJSON = {
                    op: json.op,
                    x: json.x,
                    y: json.y,
                    result: calc(json.op,json.x,json.y)
                };

                return sendResult(response,storedJSON);

            case 'PUT':

                if(!storedJSON)
                    return sendError(response,404,'JSON not found');

                json = JSON.parse(body);

                storedJSON = {
                    op: json.op,
                    x: json.x,
                    y: json.y,
                    result: calc(json.op,json.x,json.y)
                };

                return sendResult(response,storedJSON);

            case 'DELETE':

                if(!storedJSON)
                    return sendError(response,404,'JSON not found');

                storedJSON = null;
                response.writeHead(200);
                return response.end();

            default:
                return sendError(response,405,'Method not allowed');
        }

    });
});

httpHandler.listen(PORT, () =>{
    console.log(`server running at http://localhost:${PORT}/NGINX-test`);
    console.log(`server through NGINX running at http://localhost:20000/api/Save-JSON`);
});
