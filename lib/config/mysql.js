const mysql = require('mysql');

const local_mysql_config = {
    host: "localhost",
    port: 3306,
    database: 'mysql-graphql',
    user: "root",
    password: "root@123"
}

const mysql_config = local_mysql_config;

var connection = undefined;

exports.mysqlConnection = function () {
    if (connection) {
        console.log('Returning existing connection pool');
        return connection;
    }
    // Important: Ensure that sum of all the server node's pool connectionLimit size < db's max_connections
    var connection = mysql.createPool({
        connectionLimit: 25,
        host: mysql_config.host,
        database: mysql_config.database,
        user: mysql_config.user,
        password: mysql_config.password,
        charset: "utf8mb4"
    });

    connection.on('acquire', function (connection) {
        console.log('Connection %d acquired', connection.threadId);
    });

    connection.on('enqueue', function () {
        console.log('Waiting for available connection slot');
    });

    connection.on('release', function (connection) {
        console.log('Connection %d released', connection.threadId);
    });

    //Flag to identify db connection type, It's required for handling transactional connections
    connection.is_pool_conn = true;
    return connection;
};

exports.transactionalConnection = function (connection) {
    return new Promise(function (resolve, reject) {
        if (!connection) {
            return reject(new Error('Connection is not intialized.'));
        }
        if (!connection.is_pool_conn) {
            return resolve(connection);
        }
        connection.getConnection(function (err, conn) {
            if (err) {
                return reject(err);
            }
            return resolve(conn);
        });
    });
};
