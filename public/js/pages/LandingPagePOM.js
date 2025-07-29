import { AbstractPOM } from "./AbstractPOM.js";
export class LandingPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/landing.html");
        const loginForm = document.getElementById("FormLogin");
        const toggleLogin = document.getElementById("ToggleLoginPassword");
        const inputLogin = document.getElementById("FormLoginPassword");
        toggleLogin?.addEventListener("click", () => {
            const icon = toggleLogin.querySelector("i");
            if (inputLogin.type === "password") {
                inputLogin.type = "text";
                icon?.classList.remove("bi-eye");
                icon?.classList.add("bi-eye-slash");
            }
            else {
                inputLogin.type = "password";
                icon?.classList.remove("bi-eye-slash");
                icon?.classList.add("bi-eye");
            }
        });
        document.getElementById("ButtonLoginUser").addEventListener("click", async () => {
            const username = document.getElementById("FormLoginUsername").value.trim();
            const password = document.getElementById("FormLoginPassword").value.trim();
            if (!username || !password) {
                this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                return;
            }
            const success = await this.appManager.login(username, password);
            if (success) {
                this.showToast("Login erfolgreich.", true);
                loginForm.reset();
                this.appManager.loadStartPage();
            }
            else {
                this.showToast("Falsche Anmeldedaten.", false);
            }
        });
        document.getElementById("LinkImpressum").addEventListener("click", () => {
            this.appManager.loadImpressumPage();
        });
        document.getElementById("LinkRoot").addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
        });
        this.appManager.updateMenuExtras();
    }
}
//# sourceMappingURL=LandingPagePOM.js.map