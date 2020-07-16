const { Router } = require('express');
const router = new Router();

const { refreshEmployeesTable } = require('../services/employees.service');

const { requestHandler } = require('../shared/requestHandler');

router.post('/', async (req, res, next) => {
    requestHandler(req, res, refreshEmployeesTable);
});


exports.EmployeesController = router;

