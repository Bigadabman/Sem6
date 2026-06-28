const app = require('express')();
const passport = require('passport');
const { DigestStrategy } = require('passport-http');
const creds = require('./creds');

const PORT = 3000;

const session = require('express-session')({
    resave:false,
    saveUninitialized: false,   
    secret: '12345678'
});



passport.use(new DigestStrategy({qop: 'auth'}, (user, done) => {
    console.log('passport.use: ', user,)

    let rc = null;
    let cr = creds.getCredentials(user);

    if(!cr) rc = done(null, false, {message: "incorrect username"});
    else rc = done (null, cr.user, cr.password);
 
    return rc;

},(params, done) =>{
    console.log('params ', params),
    done(null, true);
}
))

passport.serializeUser((user, done) => {
    console.log('serialize ', user);
    done(null, user);
})

passport.deserializeUser((user, done) => { 
    console.log('deserialize ', user);
    done(null, user);
})


app.use(session)
app.use(passport.initialize());
app.use(passport.session());

app.get('/resource',
    passport.authenticate('digest', { session: false }),
    (req, res) => {
        res.send('RESOURCE');
    }
);


app.get('/login',
    passport.authenticate('digest', { session: false }),
    (req, res) => {
        res.redirect('/resource');
    }
);

app.get('/logout', (req, res) => {
    res.set('WWW-Authenticate', 'Digest realm="Users", qop="auth", nonce="12345"');
    res.status(401).send('Logged out');
});


app.use((req, res) => {
    res.status(404).send('404 Not Found')
})


app.listen(PORT, () => { console.log(`server running at http://localhost:${PORT}`) })