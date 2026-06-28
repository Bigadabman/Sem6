const credentials = require('./creadentials.json')

let getCredentials = (user) =>{
    let u = credentials.users.find((e) => {return e.user.toUpperCase() == user.toUpperCase()})
    return u;
};

const verPassword = (pass1, pass2) => {
    return pass1 == pass2;
}


module.exports = {
    getCredentials: getCredentials,
    verPassword: verPassword
}