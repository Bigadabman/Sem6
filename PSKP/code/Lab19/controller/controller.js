const DB = require('./../model/model');
const db = new DB();

class BankController {

    _userExists = async (id) => {
        try {
            let user = await db.getUserById(id);
            return user.recordset.length != 0;
        }
        catch(err){
            console.log(`failed to check user ${id}: ${err.message}`);
            return false;
        }
    }

    getAllUsers = async (req, res) => {

        try{
           
            let users = await db.getAllUsers();
            res.json(users.recordset);
    
        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }


    getUserById = async (req, res) => {
        try{
            if(this._userExists(req.params.id)){
                let user = await db.getUserById(req.params.ownerId);
                res.json(user.recordset)
            }
            else{
                res.status(404).json({err: `Нет пользователя с id = ${req.params.ownerId}`})
            }

        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }

    getAccountById = async (req, res) => {
        try{
            let user = await db.getAccountsById(req.params.id);
            res.json(user.recordset);
        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }


    getUserAccounts = async (req, res) => {
        try{
            if(this._userExists(req.params.ownerId)){
                let accounts = await db.getAccountByOwnerId(req.params.ownerId);
                res.json(accounts.recordset)
            }
            else{
                res.status(404).json({err: `Нет пользователя с id = ${req.params.ownerId}`})
            }
        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }

    addAcountToUser = async (req, res) => {
        try{

            if(this._userExists(req.params.owner)){
                let accounts = await db.addAccountToUser(req.params.ownerId);
                res.json(accounts.recordset)
            }
            else{
                res.status(404).json({err: `Нет пользователя с id = ${req.params.ownerId}`})
            }

        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }


    createUser = async (req, res) => {
        try{

            let userId = await db.addUser(req.body.name);
            let user = await db.getUserById(userId)
            res.json(user.recordset)
        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }


    deposit = async (req, res) => {
        try{

            if(this._userExists(req.params.ownerId)){
                let acc = await db.deposit(req.params.ownerId, req.body.sum, req.params.id);
                res.json(acc.recordset);
            }
            else{
                res.status(404).json({err: `Нет пользователя с id = ${req.params.ownerId}`})
            }
            
        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }


    withdraw = async (req, res) => {
        try{

            if(this._userExists(req.params.ownerId)){
                let acc = await db.withdraw(req.params.ownerId, req.body.sum, req.params.id); 
                res.json(acc.recordset);
            }
            else{
                res.status(404).json({err: `Нет пользователя с id = ${req.params.ownerId}`})
            }

        }
        catch(err){
            res.status(500).json({err: err.message})
        }
    }

}


module.exports = new BankController();
