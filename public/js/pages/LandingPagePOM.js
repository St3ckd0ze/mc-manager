import { AbstractPOM } from "./AbstractPOM.js";
import { UserManagementPagePOM } from "./UserManagementPagePOM.js";
export class LandingPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/landing.html");
        const loginForm = document.getElementById("FormLogin");
        const signupForm = document.getElementById("FormSignup");
        const toggleSignup = document.getElementById("ToggleSignupPassword");
        const inputSignup = document.getElementById("FormSignupPassword");
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
        toggleSignup?.addEventListener("click", () => {
            const icon = toggleSignup.querySelector("i");
            if (inputSignup.type === "password") {
                inputSignup.type = "text";
                icon?.classList.remove("bi-eye");
                icon?.classList.add("bi-eye-slash");
            }
            else {
                inputSignup.type = "password";
                icon?.classList.remove("bi-eye-slash");
                icon?.classList.add("bi-eye");
            }
        });
        document.getElementById("LinkShowSignupDialog").addEventListener("click", () => {
            signupForm.style.display = "block";
            loginForm.style.display = "none";
        });
        document.getElementById("LinkShowLoginDialog").addEventListener("click", () => {
            signupForm.style.display = "none";
            loginForm.style.display = "block";
        });
        document.getElementById("ButtonSignupUser").addEventListener("click", async () => {
            const username = document.getElementById("FormSignupUsername").value.trim();
            const password = document.getElementById("FormSignupPassword").value.trim();
            const firstName = document.getElementById("FormSignupFirstName").value.trim();
            const lastName = document.getElementById("FormSignupLastName").value.trim();
            if (!username || !password) {
                this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                return;
            }
            if (password.length < 7) {
                this.showToast("Passwort muss mindestens 7 Zeichen haben!", false);
                return;
            }
            const success = await this.appManager.addUser(username, firstName, lastName, password);
            if (success) {
                this.showToast("User erfolgreich registriert.", true);
                signupForm.reset();
            }
            else {
                this.showToast("User ID existiert bereits.", false);
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
                this.appManager.loginCount += 1;
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
        document.getElementById("LinkUserManagement").addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                new UserManagementPagePOM(this.appManager).loadPage();
            }
        });
    }
}
//# sourceMappingURL=LandingPagePOM.js.map