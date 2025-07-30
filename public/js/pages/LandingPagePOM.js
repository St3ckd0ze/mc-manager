import { AbstractPOM } from "./AbstractPOM.js";
export class LandingPagePOM extends AbstractPOM {
    appManager;
    toggleLoginListener;
    loginButtonListener;
    impressumLinkListener;
    rootLinkListener;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/landing.html");
        const loginForm = document.getElementById("FormLogin");
        const toggleLogin = document.getElementById("ToggleLoginPassword");
        const inputLogin = document.getElementById("FormLoginPassword");
        // Listener für Toggle Passwort anzeigen/ausblenden
        this.toggleLoginListener = () => {
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
        };
        toggleLogin?.addEventListener("click", this.toggleLoginListener);
        // Listener für Login-Button
        this.loginButtonListener = async () => {
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
        };
        document.getElementById("ButtonLoginUser")?.addEventListener("click", this.loginButtonListener);
        // Listener für Impressum-Link
        this.impressumLinkListener = () => {
            this.appManager.loadImpressumPage();
        };
        document.getElementById("LinkImpressum")?.addEventListener("click", this.impressumLinkListener);
        // Listener für Root-Link
        this.rootLinkListener = () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
        };
        document.getElementById("LinkRoot")?.addEventListener("click", this.rootLinkListener);
        this.appManager.updateMenuExtras();
    }
    async unloadPage() {
        const toggleLogin = document.getElementById("ToggleLoginPassword");
        const loginButton = document.getElementById("ButtonLoginUser");
        const impressumLink = document.getElementById("LinkImpressum");
        const rootLink = document.getElementById("LinkRoot");
        if (toggleLogin && this.toggleLoginListener) {
            toggleLogin.removeEventListener("click", this.toggleLoginListener);
            this.toggleLoginListener = undefined;
        }
        if (loginButton && this.loginButtonListener) {
            loginButton.removeEventListener("click", this.loginButtonListener);
            this.loginButtonListener = undefined;
        }
        if (impressumLink && this.impressumLinkListener) {
            impressumLink.removeEventListener("click", this.impressumLinkListener);
            this.impressumLinkListener = undefined;
        }
        if (rootLink && this.rootLinkListener) {
            rootLink.removeEventListener("click", this.rootLinkListener);
            this.rootLinkListener = undefined;
        }
    }
}
//# sourceMappingURL=LandingPagePOM.js.map