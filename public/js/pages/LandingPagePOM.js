import { AbstractPOM } from "./AbstractPOM.js";
import { UserManagementPagePOM } from "./UserManagementPagePOM.js";
export class LandingPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    showPage() {
        this.clearPageContent();
        const pageContent = document.getElementById("PageContent");
        const container = document.createElement("div");
        container.id = "LandingPage";
        container.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
          <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
            
            <form id="FormLogin">
              <h3 class="text-center mb-3">Login</h3>
              <div class="mb-3">
                <input id="FormLoginUsername" type="text" class="form-control" placeholder="User ID">
              </div>
              <div class="mb-3">
                <input id="FormLoginPassword" type="password" class="form-control" placeholder="Password">
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="ButtonLoginUser" class="btn btn-primary">Login</button>
              </div>
              <div class="text-center">
                <a href="#" id="LinkShowSignupDialog">Noch kein Konto? Registrieren</a>
              </div>
            </form>

            <form id="FormSignup" style="display:none;">
              <h3 class="text-center mb-3">Registrieren</h3>
              <div class="mb-3">
                <input id="FormSignupUsername" type="text" class="form-control" placeholder="User ID">
              </div>
              <div class="mb-3">
                <input id="FormSignupPassword" type="password" class="form-control" placeholder="Password">
              </div>
              <div class="mb-3">
                <input id="FormSignupFirstName" type="text" class="form-control" placeholder="First Name">
              </div>
              <div class="mb-3">
                <input id="FormSignupLastName" type="text" class="form-control" placeholder="Last Name">
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="ButtonSignupUser" class="btn btn-success">Registrieren</button>
              </div>
              <div class="text-center">
                <a href="#" id="LinkShowLoginDialog">Zurück zum Login</a>
              </div>
            </form>

          </div>
        </div>   
                `;
        pageContent?.appendChild(container);
        const loginForm = document.getElementById("FormLogin");
        const signupForm = document.getElementById("FormSignup");
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
                new UserManagementPagePOM(this.appManager).showPage();
            }
        });
    }
}
//# sourceMappingURL=LandingPagePOM.js.map