import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class StartPagePOM extends AbstractPOM{
    constructor(private appManager: ApplicationManager) {
        super();
    }


    async loadPage(): Promise<void> {
        
        await AbstractPOM.showPage(`./html/start.html`);
    
        const user = this.appManager.getLoggedInUser();
        const userCount = await this.appManager.getUserCount();
        const greeting = user ? `${user.firstName} ${user.lastName}` : "Guest";
        const verb = await userCount === 1 ? "ist" : "sind";

        const welcomeText = document.getElementById("StartPageWelcomeText");
        const userCountSpan = document.getElementById("UserCount");
        const wrongLoginCount = document.getElementById("WrongLogins");

        if (wrongLoginCount) {
            wrongLoginCount.style.visibility = "visible";
            wrongLoginCount.textContent = String(this.appManager.loginCount + " falsche Logins");
        }


        //this.showToast("Es haben sich " + this.appManager.loginCount + " Nutzer inkorrekt eingeloggt!", false);

        if (welcomeText && userCountSpan) {
            welcomeText.style.visibility = "invisible";
            userCountSpan.textContent = String(userCount);
            welcomeText.textContent = `Hallo ${greeting}! Es ${verb} aktuell ${userCount} Benutzer im System registriert.`;
            welcomeText.style.visibility = "visible";
        }

    
        document.getElementById("LinkLogout")!.addEventListener("click", () => {
            this.appManager.logout();
            this.appManager.loadLandingPage();
            
        });

        document.getElementById("LinkImpressum")!.addEventListener("click", () => {
            this.appManager.loadImpressumPage();
        });
        document.getElementById("LinkUserManagement")!.addEventListener("click", () => {
            this.appManager.loadUserManagementPage();
        });
        document.getElementById("StartPageLinkUserManagement")?.addEventListener("click", () => {
            this.appManager.loadUserManagementPage();
        });
    }


}