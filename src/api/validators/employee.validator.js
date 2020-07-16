const joi = require('@hapi/joi');

const employeeShema = joi.object({
    employeeNo: joi.string().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi.string().trim().regex(/[0-9]/).max(15).required()
});

module.exports = {
    employeeShema
}