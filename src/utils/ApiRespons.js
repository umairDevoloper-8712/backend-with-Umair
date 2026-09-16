class ApiRespons {
    constructor(statusCode, data, massege = "success") 
    {
        this.statusCode = statusCode,
            this.massege = massege,
            this.data = data,
            this.success = statusCode < 400
    }

}
export {ApiRespons}