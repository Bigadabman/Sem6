const express = require('express');
const router = express.Router();
const controller = require('./controller/controller')
const PORT = 3000;

let app = express();

app.use(express.json());
router.get('/users', controller.getAllUsers);
router.get('/users/:ownerId', controller.getUserById);
router.get('/users/:ownerId/accounts', controller.getUserAccounts);
router.get('/users/:ownerId/accounts/:id', controller.getAccountById);

router.post('/users', controller.createUser);
router.post('/users/:ownerId/accounts', controller.addAcountToUser);

router.patch('/users/:ownerId/accounts/:id/deposit', controller.deposit);
router.patch('/users/:ownerId/accounts/:id/withdraw', controller.withdraw);

app.use('/', router);


app.listen(PORT, () => { console.log(`Server running at http://localhost:3000`) })