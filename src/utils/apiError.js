class ApiError extends Error {
    constructor(
        statusCode,
        massege = "somthing went rong",
        errors = [],
        stack = ""
    ) {
        super(massege)
        this.statusCode = statusCode,
            this.data = null
        this.massege = massege
        this.errors = errors



        if (stack) {
            this.stack = stack

        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }


}
export { ApiError}