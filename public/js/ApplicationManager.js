import { User } from './domain/User.js';
import { LandingPagePOM } from './pages/LandingPagePOM.js';
import { StartPagePOM } from './pages/StartPagePOM.js';
import { ImpressumPagePOM } from './pages/ImpressumPagePOM.js';
import { UserManagementPagePOM } from './pages/UserManagementPagePOM.js';
export class ApplicationManager {
    users = new Map();
    loggedInUser; // am anfang ist der user noch nicht eingelogt, also auch nicht vom typ user
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
    addUser(userID, firstName, lastName, password) {
        // gucken, ob userID bereits vergeben wurde
        if (this.users.has(userID))
            return false;
        this.users.set(userID, new User(userID, firstName, lastName, password));
        return true;
    }
    login(userID, password) {
        const user = this.users.get(userID);
        if (user != null && user.password === password) {
            // wenn der user existiert und das pw stimmt, dann log den user in
            this.loggedInUser = user;
            return true;
        }
        return false;
    }
    logout() {
        this.loggedInUser = undefined;
    }
    isLoggedIn() {
        if (this.loggedInUser != undefined) {
            return true;
        }
        return false;
    }
    getLoggedInUser() {
        return this.loggedInUser;
    }
    getUserCount() {
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
//# sourceMappingURL=ApplicationManager.js.map