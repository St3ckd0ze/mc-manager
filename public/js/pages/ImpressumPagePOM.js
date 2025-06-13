import { AbstractPOM } from "./AbstractPOM.js";
export class ImpressumPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/impressum.html");
        document.getElementById("LinkRoot").addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
        });
    }
}
//# sourceMappingURL=ImpressumPagePOM.js.map