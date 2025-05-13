import { AbstractPOM } from "./AbstractPOM.js";
export class StartPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    showPage() {
        this.clearPageContent();
        const pageContent = document.getElementById("PageContent");
        const container = document.createElement("div");
        container.id = "StartPage";
        const user = this.appManager.getLoggedInUser();
        const userCount = this.appManager.getUserCount();
        const greeting = user ? `${user.firstName} ${user.lastName}` : "Guest";
        container.innerHTML = `
            <p id="StartPageWelcomeText">Welcome ${greeting}! (<span id="UserCount">${userCount}</span> users)</p>
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
    }
}
//# sourceMappingURL=StartPagePOM.js.map