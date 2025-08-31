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

    private linkBackupClickHandler = (e: Event) => {
        e.preventDefault();
        this.appManager.loadBackupsPage();
    };

    constructor(private appManager: ApplicationManager) {
        super();
    }

    async loadPage(): Promise<void> {
        await AbstractPOM.showPage("./html/impressum.html");

        // EventListener anhängen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) linkRoot.addEventListener("click", this.linkRootClickHandler);

        const linkBackup = document.getElementById("nav-backup");
        if (linkBackup) linkBackup.addEventListener("click", this.linkBackupClickHandler);

        // Überschrift je nach Tageszeit färben
        const header = document.querySelector("h1");
        if (header) {
            const hour = new Date().getHours();
            // 6 bis 18 Uhr → Tag → schwarz, sonst Nacht → weiß
            header.style.color = (hour >= 6 && hour < 18) ? "black" : "white";
        }
    }

    async unloadPage(): Promise<void> {
        // EventListener entfernen
        const linkRoot = document.getElementById("LinkRoot");
        if (linkRoot) linkRoot.removeEventListener("click", this.linkRootClickHandler);

        const linkBackup = document.getElementById("nav-backup");
        if (linkBackup) linkBackup.removeEventListener("click", this.linkBackupClickHandler);

        this.clearPageContent();
    }
}


