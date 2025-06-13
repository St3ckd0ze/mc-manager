import { User } from './domain/User.js'
import { LandingPagePOM } from './pages/LandingPagePOM.js';
import { StartPagePOM } from './pages/StartPagePOM.js';
import { ImpressumPagePOM } from './pages/ImpressumPagePOM.js';
import { UserManagementPagePOM } from './pages/UserManagementPagePOM.js';

export class ApplicationManager {

    loginCount = 0;
    //users = new Map<string, User>();
    loggedInUser: User | undefined;

    constructor() {
    }

    loadLandingPage() {
        new LandingPagePOM(this).loadPage();
        this.updateMenuExtras();
    }

    loadStartPage() {
        new StartPagePOM(this).loadPage();
        this.updateMenuExtras();
    }
    
    loadImpressumPage() {
        new ImpressumPagePOM(this).loadPage();
        this.updateMenuExtras();
    }
    
    loadUserManagementPage() {
        new UserManagementPagePOM(this).loadPage();
            this.updateMenuExtras();
    }
    
    async addUser(userID: string, firstName: string, lastName: string, password: string): Promise<boolean> {
        const response = await fetch('http://localhost:80/api/users', {
                method: 'POST',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify({
                    userID: userID,
                    password: password,
                    firstName: firstName,
                    lastName: lastName

                })
            });


        if (!response.ok) {
            console.error("Fehler beim Hinzufügen des Users:", response.statusText);
            return false;
        }
        return true;
    }

    async login(userID: string, password: string): Promise<boolean> {
        const response = await fetch("http://localhost:80/api/login", {
            method: "GET",
            headers: { "Authorization": "Basic " + btoa(userID + ":" + password) }
        });


        if (!response.ok) {
            console.error("Login fehlgeschlagen:", response.statusText);
            return false;
        }

        const data = await response.json();
        if (data) {
            this.loggedInUser = new User(data.userID, data.firstName, data.lastName, data.password);
            this.updateMenuExtras();
            return true;
        } else {
            console.error("Login fehlgeschlagen:", data.message);
            return false;
        }
    }

    logout() {
        this.loggedInUser = undefined;
    }

    isLoggedIn(): boolean {
        if(this.loggedInUser != undefined) {
            return true;
        }
        return false;
    }

    getLoggedInUser(): User | undefined {
        return this.loggedInUser;
    }

    async getUserCount(): Promise<number> {
        const response = await fetch("http://localhost:80/api/users/count", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error("Fehler beim Abrufen der User-Anzahl:", response.statusText);
            return 0;
        }
        const data = await response.json() as { UserCount: number };
        return data.UserCount;

    }

    updateMenuExtras() {
    const logoutButton = document.getElementById("LinkLogout");
    if (logoutButton) {
        logoutButton.classList.toggle("d-none", !this.isLoggedIn());
    }

    const userManagementLink = document.getElementById("LinkUserManagement");
    if (userManagementLink) {
        userManagementLink.classList.toggle("d-none", !this.isLoggedIn());
    }
}



    async getUsers(): Promise<User[]> {
        const response = await fetch("http://localhost:80/api/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error("Fehler beim Abrufen der User:", response.statusText);
            return [];
        }
        
        const data = await response.json();
        return data
    }

    async deleteUser(userID: string): Promise<boolean> {
    const response = await fetch(`http://localhost:80/api/users/${userID}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        console.error("Fehler beim Löschen des Users: " + userID);
        return false;
    }

    return true;
}
}