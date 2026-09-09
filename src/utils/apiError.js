class ApiError extends Error {
    constructor(
        statusCode,
        msssege = "somthing went rong",
        errors = [],
        stack = ""
    ) {
        super(massege)
        this.statusCode = statusCode,
            this.data = null
        this.messege = messege
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