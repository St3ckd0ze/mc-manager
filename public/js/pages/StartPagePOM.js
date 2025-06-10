import { AbstractPOM } from "./AbstractPOM.js";
export class StartPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async showPage() {
        this.clearPageContent();
        const pageContent = document.getElementById("PageContent");
        if (pageContent)
            pageContent.innerHTML = "";
        const container = document.createElement("div");
        container.id = "StartPage";
        const user = this.appManager.getLoggedInUser();
        const userCount = await this.appManager.getUserCount();
        const greeting = user ? `${user.firstName} ${user.lastName}` : "Guest";
        const verb = await userCount === 1 ? "ist" : "sind";
        container.innerHTML = `
            <div class="p-4">
                <p id="StartPageWelcomeText">Hallo ${greeting}! Es ${verb} aktuell <span id="UserCount">${userCount}</span> Benutzer im System registriert.</p>
                <button id="StartPageLinkUserManagement" class="btn btn-primary mt-3">Zur Benutzerverwaltung</button>
            </div>
        `;
        pageContent?.appendChild(container);
        document.getElementById("LinkLogout").addEventListener("click", () => {
            this.appManager.logout();
            this.appManager.loadLandingPage();
        });
        document.getElementById("LinkImpressum").addEventListener("click", () => {
            this.appManager.loadImpressumPage();
        });
        document.getElementById("LinkUserManagement").addEventListener("click", () => {
            this.appManager.loadUserManagementPage();
        });
        document.getElementById("StartPageLinkUserManagement")?.addEventListener("click", () => {
            this.appManager.loadUserManagementPage();
        });
    }
    loadEventListeners() {
    }
}
//# sourceMappingURL=StartPagePOM.js.map