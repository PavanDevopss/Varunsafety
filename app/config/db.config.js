// Old DB server
// module.exports = {
//   HOST: "192.168.10.212",
//   USER: "postgres",
//   PASSWORD: "openpgpwd",
//   DB: "VGITSVMS",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// VM DB New Server
// module.exports = {
//   HOST: "192.168.10.69",
//   USER: "postgres",
//   PASSWORD: "123456",
//   DB: "VGITSDEV",
//   dialect: "postgres",
//   port: 5432,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

//VM DB Test Server
module.exports = {
  HOST: "192.168.10.69",
  USER: "postgres",
  PASSWORD: "123456",
  DB: "VGITSDEV",
  dialect: "postgres",
  port: 5432,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

//80 server
// module.exports = {
//   HOST: "192.168.10.69",
//   USER: "postgres",
//   PASSWORD: "123456",
//   DB: "TestDB",
//   dialect: "postgres",
//   port: 5432,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// local machine test db
// module.exports = {
//   HOST: "localhost",
//   USER: "postgres",
//   PASSWORD: "1234",
//   DB: "VGITSDEV",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// Prod virtual machine db
// module.exports = {
//   HOST: "192.168.10.82",
//   USER: "postgres",
//   PASSWORD: "Prod@123456",
//   DB: "VMSPRODDB",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// module.exports = {
//   HOST: "192.168.10.82",
//   USER: "postgres",
//   PASSWORD: "Prod@123456",
//   DB: "VGITSDEV",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

/***************************************************************************************************/

/* Using connection string */

// Old DB server
//   CONNECTION_STRING: "postgres://postgres:openpgpwd@192.168.10.212:5432/VGITSVMS",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// VM DB New Server
//   CONNECTION_STRING: "postgres://postgres:123456@192.168.10.69:5432/VGITSDEV",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// local machine test db
// module.exports = {
//   CONNECTION_STRING: "postgres://postgres:1234@localhost:5432/VGITSDEV",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

// Prod virtual machine db
// module.exports = {
//   CONNECTION_STRING: "postgres://postgres:Prod@123456@192.168.10.82:5432/VMSPRODDB",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };
