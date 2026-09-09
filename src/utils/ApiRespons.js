class ApiRespons {
    constructor(statusCode, data, mssege = "success") 
    {
        this.statusCode = statusCode,
            this.messege = messege,
            this.data = data,
            this.success = statusCode < 400
    }

}
export {ApiRespons}