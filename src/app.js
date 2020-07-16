const express = require('express');
const { green, blue } = require('chalk');
const { json, urlencoded } = require('body-parser');
const cors = require('cors');
const morgan =  require('morgan');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');


dotenv.config();

const { Database } = require('./api/database/db');
const { EmployeesController } = require('./api/controllers/employees.controller');

const app = express();

Database.authenticate()
    .then(() => { console.log("Database connected!")})
    .catch(() => { console.log('err') });

app.use(cors());
app.use(urlencoded({extended: false}));
app.use(json());
app.use(morgan('dev'));

//set fileuploading
app.use(fileUpload());

app.use('/employee', EmployeesController);

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
    console.log(green.bold.inverse(`server listening to the port: ${blue.bold(' '+PORT+' ')} `));
})  