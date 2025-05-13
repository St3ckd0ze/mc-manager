import { User } from './domain/User.js'
import { LandingPagePOM } from './pages/LandingPagePOM.js';
import { StartPagePOM } from './pages/StartPagePOM.js';
import { ImpressumPagePOM } from './pages/ImpressumPagePOM.js';
import { UserManagementPagePOM } from './pages/UserManagementPagePOM.js';

export class ApplicationManager {

    users = new Map<string, User>();
    loggedInUser: User | undefined;

    constructor() {
        this.addUser("admin", "Manfred", "Mustermann", "123");
    }

    loadLandingPage() {
        new LandingPagePOM(this).showPage();
        this.updateMenuExtras();
    }

    loadStartPage() {
        new StartPagePOM(this).showPage();
        this.updateMenuExtras();
    }

    loadImpressumPage() {
        new ImpressumPagePOM(this).showPage();
        this.updateMenuExtras();
    }

    addUser(userID: string, firstName: string, lastName: string, password: string): boolean {
        if(this.users.has(userID))
            return false;
        this.users.set(userID, new User(userID, firstName, lastName, password));
        return true;
    }

    login(userID: string, password: string): boolean {
        const user = this.users.get(userID);
        if(user != null && user.password === password) {
            this.loggedInUser = user;
            return true;
        }
        return false;
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

    getUserCount(): number {
        return this.users.size;
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
userManagementPage = new UserManagementPagePOM(this);

loadUserManagementPage() {
    this.userManagementPage.showPage();
}

}