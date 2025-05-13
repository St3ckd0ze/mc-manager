export class User {
    userID: string;
    firstName: string;
    lastName: string;
    password: string;

    constructor(userID: string, firstName: string, lastName: string, password: string) {
        this.userID = userID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }
}