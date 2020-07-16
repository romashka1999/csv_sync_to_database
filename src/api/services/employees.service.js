const fs = require('fs');
const csv = require('fast-csv');
const path = require('path');
const HttpStatus = require('http-status-codes');

const { Employee } = require('../database/models/employee.model');
const { employeeShema } = require('../validators/employee.validator');
const { uploadFile } = require('../helpers/uploadFile.helper');


const refreshEmployeesTable = async (req) => {
    try {

        if(!req.files) {
            throw { error: 'please upload csv file with appropriate name', code: HttpStatus.BAD_REQUEST }
        }

        if(!req.files.employees) {
            throw { error: 'please upload csv file with appropriate name', code: HttpStatus.BAD_REQUEST }
        }

        function csvParsed() {
            const parsedRows = [];
            return new Promise((resolve, reject) => {

                const filePath = uploadFile(req.files.employees);
                console.log('filePath :>> ', filePath);

                fs.createReadStream(filePath)
                    .pipe(csv.parse({headers: true}))
                    .on('error', error => console.error(error))
                    .on('data', row => parsedRows.push(row))
                    .on('end', (rowCount) => {console.log(`Parsed ${rowCount} rows`), fs.unlinkSync(filePath); resolve(parsedRows); });
            })
        }

        const csvEmployees = await csvParsed();

        // Time complexity: O(N) operation
        // validate employee objects in array
        for (const em of csvEmployees) {
            const validate = employeeShema.validate(em);
            // if object schema is not appropriate
            if(validate.error) {
                const error = {
                    error: validate.error.details,
                    code: HttpStatus.BAD_REQUEST
                }
                throw error;
            }
        }
        
        
        // select data from employees table
        // ==> we need this select because of - - - "reporting"
        const dbEmployees = await Employee.findAll();
        const deletedEmployeesFixator = {};

        // Time complexity: O(N) operation
        for (const em of dbEmployees) {
            deletedEmployeesFixator[em.employeeNo] = true;
        }

        // create array for reporting 
        const reporting = [];

        const REPORTING_ACTIONS = {
            CREATE: 'CREATE',
            UPDATE: 'UPDATE',
            RESTORE: 'RESTORE',
            DELETE: 'DELETE'
        }

        // array for database synchronization
        const dataForCreateOrUpdate = [];

        // Time complexity: O(N * M) operation
        for (const employee of csvEmployees) {
            // check employee if it is removed
            if(deletedEmployeesFixator[employee.employeeNo]) {
                deletedEmployeesFixator[employee.employeeNo] = false;
            }

            const employeeInDb = dbEmployees.findIndex(e => e.employeeNo === employee.employeeNo);
            // set employee's isDeleted field to false because it is active employee
            employee.isDeleted = false;
            dataForCreateOrUpdate.push(employee);

            if(employeeInDb === -1) {
                // if csv employee does not exist in database
                // ===> we must add this employee in db
                reporting.push({ employeeNo: employee.employeeNo, action: REPORTING_ACTIONS.CREATE });
            } else {
                // if csv employee exists in database and it was deleted
                // ===> we must update this employee and also restored
                if(dbEmployees[employeeInDb].isDeleted) {
                    reporting.push({ employeeNo: dbEmployees[employeeInDb].employeeNo, action: REPORTING_ACTIONS.RESTORE });
                } else {
                    reporting.push({ employeeNo: employee.employeeNo, action: REPORTING_ACTIONS.UPDATE });
                }
            } 
        }
   
				 
        // Time complexity: O(N) operation
        for (const employeeNo of Object.keys(deletedEmployeesFixator)) {
            // if emploee does not exist csv file 
            // ==> it must be removed in db
            if(deletedEmployeesFixator[employeeNo]) {
                reporting.push({ employeeNo , action: REPORTING_ACTIONS.DELETE });

                const employeeIndex = dbEmployees.findIndex(e => e.employeeNo === employeeNo);
                const employee = dbEmployees[employeeIndex].dataValues;
                
                // set employee's isDeleted field to true because it was deleted
                employee.isDeleted = true;
                dataForCreateOrUpdate.push(employee);
            }
        }


        // console.log('dataForCreateOrUpdate :>> ', dataForCreateOrUpdate);
    
        // BULK UPSERT (insert or update records)
        if(dataForCreateOrUpdate.length > 0) {
            await Employee.bulkCreate(dataForCreateOrUpdate, { updateOnDuplicate: ['employeeNo'] });
        }

        // create report file
        const ws = fs.createWriteStream("./uploads/report.csv");
        csv.write(reporting, { headers: true })
           .pipe(ws);

        return { 
            message: 'employees table was synchronized :)', 
            reportingLink: path.join(__dirname, '../../../uploads/report.csv'),
            code: dataForCreateOrUpdate.length > 0 ? HttpStatus.CREATED : HttpStatus.ACCEPTED
        }

    } catch (error) {
        if(error.code) {
            throw error;
        }
        throw { error, code: HttpStatus.INTERNAL_SERVER_ERROR }
    }
}

module.exports = {
    refreshEmployeesTable
}

