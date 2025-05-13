import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";
import { UserManagementPagePOM } from "./UserManagementPagePOM.js";

export class LandingPagePOM extends AbstractPOM {
    constructor(private appManager: ApplicationManager) {
        super();
    }

    showPage(): void {

        //aufraeumen
        this.clearPageContent();

        const pageContent = document.getElementById("PageContent");

        const container = document.createElement("div");
        container.id="LandingPage";

        container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
  <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
    
    <!-- Login-Formular -->
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

    <!-- Signup-Formular -->
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

        const loginForm = document.getElementById("FormLogin") as HTMLFormElement;
        const signupForm = document.getElementById("FormSignup") as HTMLFormElement;

        document.getElementById("LinkShowSignupDialog")!.addEventListener("click", () => {
            signupForm.style.display = "block";
            loginForm.style.display = "none";
        });

        document.getElementById("LinkShowLoginDialog")!.addEventListener("click", () => {
            signupForm.style.display = "none";
            loginForm.style.display = "block";
        });

        document.getElementById("ButtonSignupUser")!.addEventListener("click", () => {
            const username = (document.getElementById("FormSignupUsername") as HTMLInputElement).value.trim();
            const password = (document.getElementById("FormSignupPassword") as HTMLInputElement).value.trim();
            const firstName = (document.getElementById("FormSignupFirstName") as HTMLInputElement).value.trim();
            const lastName = (document.getElementById("FormSignupLastName") as HTMLInputElement).value.trim();

            if (!username || !password) {
                this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                return;
            }

            const success = this.appManager.addUser(username, firstName, lastName, password);
            if (success) {
                this.showToast("User erfolgreich registriert.", true);
                signupForm.reset();
            } else {
                this.showToast("User ID existiert bereits.", false);
            }
        });

        document.getElementById("ButtonLoginUser")!.addEventListener("click", () => {
            const username = (document.getElementById("FormLoginUsername") as HTMLInputElement).value.trim();
            const password = (document.getElementById("FormLoginPassword") as HTMLInputElement).value.trim();

            if (!username || !password) {
                this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                return;
            }

            const success = this.appManager.login(username, password);
            if (success) {
                this.showToast("Login erfolgreich.", true);
                loginForm.reset();
                this.appManager.loadStartPage();
            } else {
                this.showToast("Falsche Anmeldedaten.", false);
            }
        });

        document.getElementById("LinkImpressum")!.addEventListener("click", () => {
            this.appManager.loadImpressumPage();
        });
        
        document.getElementById("LinkRoot")!.addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
            
            
        });
        document.getElementById("LinkUserManagement")!.addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                new UserManagementPagePOM(this.appManager).showPage();
            }
        });
    }

}
