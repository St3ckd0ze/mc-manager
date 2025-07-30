import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class ImpressumPagePOM extends AbstractPOM {
    private linkRootClickHandler = () => {
        if (this.appManager.isLoggedIn()) {
            this.appManager.loadStartPage();
        } else {
            this.appManager.loadLandingPage();
        }
    };

    constructor(private appManager: ApplicationManager) {
        super();
    }

    async loadPage(): Promise<void> {
        await AbstractPOM.showPage("./html/impressum.html");
        // EventListener anhängen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) {
            linkRoot.addEventListener("click", this.linkRootClickHandler);
        }
    }

    async unloadPage(): Promise<void> {
        // EventListener entfernen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) {
            linkRoot.removeEventListener("click", this.linkRootClickHandler);
        }

        // Optional: Inhalte löschen, wenn nötig
        this.clearPageContent();
    }
}

