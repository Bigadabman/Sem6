const { Transaction } = require('mssql');
const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};" +
        "Server=(localdb)\\MSSQLLocalDB;" +
        "Database=BANK;" +
        "Trusted_Connection=yes;"
};


class DB{

    constructor (){
        this.poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('connected to database');
            return pool;
        })
        .catch(error => {
            console.error('Database connection failed: ', error);
            throw error;
        })
    };

    execQuery = async (query, params = [], transaction = null) => {
        const pool = await this.poolPromise;
        const request = transaction ? new sql.Request(transaction) : pool.request();

        params.forEach((param) => {
            request.input(param.name, param.type, param.value);
        });

        return request.query(query);
    };


    getAllUsers = () => {
        return this.execQuery('select * from users');
    }

    getUserById = (id) => {
        return this.execQuery('select * from users where id = @id',
            [{name: 'id', type: sql.Int, value: id}]
        )
    }

    getAccountsById = (id) => {
        return this.execQuery('select * from account where id = @id',
            [{name: 'id', type: sql.Int, value: id}]
        )
    }

    getAccountByOwnerId = (id) => {
        return this.execQuery('select users.name, account.id as account, account.balance from account inner join users on account.owner = users.id where users.id = @id',
            [{name: 'id', type: sql.Int, value: id}]
        )
    }



    addAccountToUser = (id) => {
        return this.execQuery('insert into account values (@owner, 0.0)',
            [{name: 'owner', type: sql.Int, value: id}]
        )
    }

    addUser = async (name) => {

    const pool = await this.poolPromise;
    const transaction = new sql.Transaction(pool);

    try {

        await transaction.begin();

        const userResult = await this.execQuery(
            `
            INSERT INTO users(name)
            OUTPUT inserted.id
            VALUES (@name)
            `,
            [{ name: 'name', type: sql.NVarChar, value: name }],
            transaction
        );

        const userId = userResult.recordset[0].id;

        await this.execQuery(
            `
            INSERT INTO account(owner, balance)
            VALUES (@owner, 0)
            `,
            [{ name: 'owner', type: sql.Int, value: userId }],
            transaction
        );

        await transaction.commit();

        return userId;

    } catch (err) {

        await transaction.rollback();
        console.log('Error happened:', err);
        throw err;

    }
};

    deposit = (owner, sum, id) => {
        this.execQuery('update account set balance = balance + @sum where owner = @owner and account.id = id',
            [{name: 'sum', type:sql.Decimal, value: sum},
            {name: 'owner', type:sql.Int, value:owner}, 
            {name: 'id', type:sql.Int, value: id}
            ]
        )

        return this.getAccountByOwnerId(id);
        
    }

    withdraw = (owner, sum, id) => {
        this.execQuery('update account set balance = balance - @sum where owner = @owner and account.id = id',
            [{name: 'sum', type:sql.Decimal, value: sum},
            {name: 'owner', type:sql.Int, value:owner}, 
            {name: 'id', type:sql.Int, value: id}
            ]
        )

        return this.getAccountByOwnerId(id);
        
    }

}


module.exports = DB;