export class User {
    userID: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;

    constructor(userID: string, firstName: string, lastName: string, password: string, role: string) {
        this.userID = userID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.role = role;
    }
}