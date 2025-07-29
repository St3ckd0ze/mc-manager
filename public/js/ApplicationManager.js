import { User } from './domain/User.js';
import { LandingPagePOM } from './pages/LandingPagePOM.js';
import { StartPagePOM } from './pages/StartPagePOM.js';
import { ImpressumPagePOM } from './pages/ImpressumPagePOM.js';
import { UserManagementPagePOM } from './pages/UserManagementPagePOM.js';
export class ApplicationManager {
    loginCount = 0;
    //users = new Map<string, User>();
    loggedInUser;
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
    async addUser(userID, firstName, lastName, password) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
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
    async login(userID, password) {
        const response = await fetch("/api/login", {
            method: "GET",
            headers: { "Authorization": "Basic " + btoa(userID + ":" + password) }
        });
        if (!response.ok) {
            console.error("Login fehlgeschlagen:", response.statusText);
            return false;
        }
        const data = await response.json();
        if (data) {
            this.loggedInUser = new User(data.userID, data.firstName, data.lastName, data.password, data.role);
            this.updateMenuExtras();
            return true;
        }
        else {
            console.error("Login fehlgeschlagen:", data.message);
            return false;
        }
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
    async getUserCount() {
        const response = await fetch("/api/users/count", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error("Fehler beim Abrufen der User-Anzahl:", response.statusText);
            return 0;
        }
        const data = await response.json();
        return data.UserCount;
    }
    updateMenuExtras() {
        const menuExtras = document.getElementById("MenuExtras");
        const navBarList = document.getElementById("NavBarList");
        if (!menuExtras || !navBarList) {
            return;
        }
        // Vorherige Buttons entfernen
        const logoutBtn = document.getElementById("LinkLogout");
        if (logoutBtn && logoutBtn.parentElement) {
            menuExtras.removeChild(logoutBtn.parentElement);
        }
        const userManagementLink = document.getElementById("LinkUserManagement");
        if (userManagementLink && userManagementLink.parentElement) {
            navBarList.removeChild(userManagementLink.parentElement);
        }
        if (!this.isLoggedIn()) {
            return;
        }
        // Logout-Button hinzufügen (immer sichtbar, wenn eingeloggt)
        const logoutLi = document.createElement("li");
        logoutLi.className = "nav-item";
        const logoutButton = document.createElement("button");
        logoutButton.id = "LinkLogout";
        logoutButton.className = "btn btn-outline-secondary";
        logoutButton.textContent = "Logout";
        logoutButton.onclick = () => {
            this.logout();
            this.loadLandingPage();
        };
        logoutLi.appendChild(logoutButton);
        menuExtras.appendChild(logoutLi);
        // User Management nur für admin anzeigen
        if (this.loggedInUser?.role === 'admin') {
            const userMgmtLi = document.createElement("li");
            userMgmtLi.className = "nav-item ms-2";
            const userMgmtLink = document.createElement("a");
            userMgmtLink.id = "LinkUserManagement";
            userMgmtLink.href = "#";
            userMgmtLink.className = "nav-link";
            userMgmtLink.textContent = "User Management";
            userMgmtLink.onclick = () => this.loadUserManagementPage();
            userMgmtLi.appendChild(userMgmtLink);
            navBarList.appendChild(userMgmtLi);
        }
    }
    async getUsers() {
        const response = await fetch("/api/users", {
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
        return data;
    }
    async deleteUser(userID) {
        const response = await fetch(`/api/users/${userID}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            console.error("Fehler beim Löschen des Users: " + userID);
            return false;
        }
        return true;
    }
    async editUser(userID, firstName, lastName, password) {
        const response = await fetch(`/api/users/${userID}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                userID: userID,
                firstName: firstName,
                lastName: lastName,
                password: password
            })
        });
        if (!response.ok) {
            console.error("Fehler beim Bearbeiten des Users:", response.statusText);
            return false;
        }
        return true;
    }
    async sendTmuxCommand(command) {
        if (!this.loggedInUser) {
            console.error("Kein User eingeloggt");
            return;
        }
        // Nur admin und manager dürfen Befehle senden
        if (this.loggedInUser.role !== 'admin' && this.loggedInUser.role !== 'manager') {
            console.error("User hat keine Berechtigung Befehle zu senden");
            return;
        }
        try {
            const response = await fetch("/api/tmux/command", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ command })
            });
            if (!response.ok) {
                console.error("Fehler beim Senden des tmux-Befehls:", response.statusText);
            }
            else {
                console.log("Befehl erfolgreich gesendet:", command);
            }
        }
        catch (error) {
            console.error("Fehler beim Senden des tmux-Befehls:", error);
        }
    }
    async getTmuxOutput() {
        try {
            const response = await fetch("/api/tmux/output", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Fehler beim Abrufen der tmux-Ausgabe:", response.statusText);
                return "";
            }
            const data = await response.json();
            return data.output || "";
        }
        catch (error) {
            console.error("Fehler beim Abrufen der tmux-Ausgabe:", error);
            return "";
        }
    }
}
//# sourceMappingURL=ApplicationManager.js.map