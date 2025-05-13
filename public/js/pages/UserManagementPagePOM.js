import { AbstractPOM } from "./AbstractPOM.js";
export class UserManagementPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    showPage() {
        this.clearPageContent();
        const container = document.createElement("div");
        container.id = "UserManagementPage";
        container.innerHTML = `
            <div class="container py-4">
                <h2>User Management</h2>
                <p>Hier wird später die Benutzerverwaltung erscheinen.</p>
            </div>
        `;
        document.getElementById("PageContent")?.appendChild(container);
    }
}
//# sourceMappingURL=UserManagementPagePOM.js.map