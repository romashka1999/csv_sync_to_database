
const requestHandler = async (req, res, callback) => {
    try {
        const response =  await callback(req);
        const statusCode = response.code;
        res.status(statusCode).send(response);
    } catch (error) {
        const statusCode = error.code;
        res.status(statusCode).send(error);
    }
};

module.exports = {
    requestHandler
}





