const JsonRPCServer = require('jsonrpc-server-http-nats');

const server = new JsonRPCServer();

server.on('Ping', (response) => {
    let error = null;
    let result = "Pong";
    response(error, result);
});

let bin_validator = (param) => {
    console.log('validator0', param);

    if (!Array.isArray(param))
        throw new Error('Ожидается массив');

    if (param.length != 2)
        throw new Error('Ожидается 2 значения');

    if (!isFinite(param[0]) || !isFinite(param[1]))
        throw new Error('Ожидается число');

    return param;
};

let arr_validator = (param) => {
    console.log('validator0', param);

    if (!Array.isArray(param))
        throw new Error('Ожидается массив');

    // if (param.length != 2)
    //     throw new Error('Ожидается 2 значения');

    if (!isFinite(param[0]) || !isFinite(param[1]))
        throw new Error('Ожидается число');

    return param;
};

server.on('mul', arr_validator, (params, channel, response) => {
        let result = params.reduce((a, b) => a * b, 1);
    response(null, result);
});

server.on('sum', arr_validator, (params, channel, response) => {
    let result = params.reduce((a, b) => a + b, 0);
    response(null, result);
});

server.on('div', bin_validator, (params, channel, response) => {
    if (params[1] === 0) {
        response(new Error('Деление на ноль'), null);
        return;
    }
    let result = params[0] / params[1];
    response(null, result);
});

server.on('proc', bin_validator, (params, channel, response) => {
    if (params[1] === 0) {
        response(new Error('Деление на ноль'), null);
        return;
    }
    let result = params[0] / params[1] * 100;
    response(null, result);
});

server.listenHttp({ host: '127.0.0.1', port: 3000 }, () => {
    console.log('JSON-RPC Server REDY');
});