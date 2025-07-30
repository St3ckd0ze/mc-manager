import { AbstractPOM } from "./AbstractPOM.js";
export class ImpressumPagePOM extends AbstractPOM {
    appManager;
    linkRootClickHandler = () => {
        if (this.appManager.isLoggedIn()) {
            this.appManager.loadStartPage();
        }
        else {
            this.appManager.loadLandingPage();
        }
    };
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/impressum.html");
        // EventListener anhängen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) {
            linkRoot.addEventListener("click", this.linkRootClickHandler);
        }
    }
    async unloadPage() {
        // EventListener entfernen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) {
            linkRoot.removeEventListener("click", this.linkRootClickHandler);
        }
        // Optional: Inhalte löschen, wenn nötig
        this.clearPageContent();
    }
}
//# sourceMappingURL=ImpressumPagePOM.js.map