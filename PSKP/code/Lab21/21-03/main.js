const app = require('express')();
const { DigestStrategy } = require('passport-http');
const creds = require('./creds');

const PORT = 3000;

const session = require('express-session')({
    resave:false,
    saveUninitialized: false,   
    secret: '12345678'
});

function checkAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.redirect('/login');
}


app.use(session)

app.use(require('express').urlencoded({ extended: true }));

app.get('/resource',
    checkAuth,
    (req, res) => {
        res.send('RESOURCE');
    }
);


app.get('/login', (req, res) => {
    if(req.session.user){
        return res.redirect('/resource');
    }
    res.send(`
        <html>
            <body>
                <h2>Login</h2>
                <form method='POST' action='/login'>
                    <input name='login' placeholder='login' />
                    <input name='password' type='password' placeholder='password'/>
                    <button type='submit'>Login</button>
                </form>
            </body>
        </html>
        `);
});


app.post('/login', (req, res) => {
    const {login, password} = req.body;

    const user = creds.getCredentials(login);

    if(!user || !creds.verPassword(user.password, password)){
        return res.send('ERROR');
    }

    req.session.user = {login: user.user};

    res.redirect('/resource')
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    })
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => { console.log(`server running at http://localhost:${PORT}`) })