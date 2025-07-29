import { AbstractPOM } from "./AbstractPOM.js";
export class UserManagementPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/user-management.html");
        this.clearPageContent();
        const users = await this.appManager.getUsers();
        const tbody = document.getElementById("UserTableBody");
        if (tbody)
            tbody.innerHTML = "";
        users.forEach((user) => {
            const row = document.createElement("tr");
            const tdUserID = document.createElement("td");
            tdUserID.id = `${user.userID}TableItemUsername`;
            tdUserID.textContent = user.userID;
            const tdFirstName = document.createElement("td");
            tdFirstName.id = `${user.userID}TableItemFirstName`;
            tdFirstName.textContent = user.firstName;
            const tdLastName = document.createElement("td");
            tdLastName.id = `${user.userID}TableItemLastName`;
            tdLastName.textContent = user.lastName;
            const tdActions = document.createElement("td");
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-success me-2";
            editButton.id = `${user.userID}TableItemEditButton`;
            editButton.textContent = "Edit";
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger me-2";
            deleteButton.id = `${user.userID}TableItemDeleteButton`;
            deleteButton.textContent = "Delete";
            const addButton = document.getElementById("ButtonAddUser");
            tdActions.appendChild(editButton);
            tdActions.appendChild(deleteButton);
            row.appendChild(tdUserID);
            row.appendChild(tdFirstName);
            row.appendChild(tdLastName);
            row.appendChild(tdActions);
            tbody?.appendChild(row);
            deleteButton.addEventListener("click", async () => {
                await this.appManager.deleteUser(user.userID);
                await this.loadPage();
            });
            addButton?.addEventListener("click", async () => {
                const pageContent = document.getElementById("UserManagementPage");
                if (pageContent)
                    pageContent.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
            <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
            <form id="FormAddUser" style="display:block;">
              <h3 class="text-center mb-3">Nutzer hinzufügen</h3>
              <div class="mb-3">
                <input id="FormAddUserUsername" type="text" class="form-control" placeholder="User ID">
              </div>
              <div class="mb-3">
              <div class="input-group">
                <input id="FormAddUserPassword" type="password" class="form-control" placeholder="Password">
                <span class="input-group-text" id="ToggleSignupPassword" style="cursor: pointer;">
                  <i class="bi bi-eye"></i>
                </span>
              </div>
              </div>
              <div class="mb-3">
                <input id="FormAddUserFirstName" type="text" class="form-control" placeholder="First Name">
              </div>
              <div class="mb-3">
                <input id="FormAddUserLastName" type="text" class="form-control" placeholder="Last Name">
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="FormAddUserSubmit" class="btn btn-success">Registrieren</button>
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="FormAddUserCancel" class="btn btn-secondary">Abbrechen</button>
              </div>
              </form>
              </div>
              </div>`;
                const toggle = document.getElementById("ToggleSignupPassword");
                const input = document.getElementById("FormAddUserPassword");
                toggle?.addEventListener("click", () => {
                    const icon = toggle.querySelector("i");
                    if (input.type === "password") {
                        input.type = "text";
                        icon?.classList.remove("bi-eye");
                        icon?.classList.add("bi-eye-slash");
                    }
                    else {
                        input.type = "password";
                        icon?.classList.remove("bi-eye-slash");
                        icon?.classList.add("bi-eye");
                    }
                });
                document.getElementById("FormAddUserCancel").addEventListener("click", async () => {
                    await this.loadPage();
                });
                document.getElementById("FormAddUserSubmit").addEventListener("click", async () => {
                    const signupForm = document.getElementById("FormAddUser");
                    const username = document.getElementById("FormAddUserUsername").value.trim();
                    const password = document.getElementById("FormAddUserPassword").value.trim();
                    const firstName = document.getElementById("FormAddUserFirstName").value.trim();
                    const lastName = document.getElementById("FormAddUserLastName").value.trim();
                    if (!username || !password) {
                        this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                        return;
                    }
                    const success = await this.appManager.addUser(username, firstName, lastName, password);
                    if (success) {
                        this.showToast("User erfolgreich registriert.", true);
                        signupForm.reset();
                        await this.loadPage();
                    }
                    else {
                        this.showToast("User ID existiert bereits.", false);
                    }
                });
            });
            editButton?.addEventListener("click", () => {
                const pageContent = document.getElementById("UserManagementPage");
                if (pageContent)
                    pageContent.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
            <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
            <form id="FormEditUser" style="display:block;">
              <h3 class="text-center mb-3">Nutzer bearbeiten</h3>
              <div class="mb-3">
                <input id="FormEditUserUsername" type="text" class="form-control" placeholder="User ID">
              </div>
              <div class="mb-3">
              <div class="input-group">
                <input id="FormEditUserPassword" type="password" class="form-control" placeholder="Password">
                <span class="input-group-text" id="ToggleEditPassword" style="cursor: pointer;">
                  <i class="bi bi-eye"></i>
                </span>
              </div>
              </div>
              <div class="mb-3">
                <input id="FormEditUserFirstName" type="text" class="form-control" placeholder="First Name">
              </div>
              <div class="mb-3">
                <input id="FormEditUserLastName" type="text" class="form-control" placeholder="Last Name">
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="FormEditUserSubmit" class="btn btn-success">Änderungen speichern</button>
              </div>
              <div class="d-grid mb-2">
                <button type="button" id="FormEditUserCancel" class="btn btn-secondary">Abbrechen</button>
              </div>
              </form>
              </div>
              </div>`;
                const usernameInput = document.getElementById("FormEditUserUsername");
                const firstNameInput = document.getElementById("FormEditUserFirstName");
                const lastNameInput = document.getElementById("FormEditUserLastName");
                const passwordInput = document.getElementById("FormEditUserPassword");
                usernameInput.value = user.userID;
                firstNameInput.value = user.firstName;
                lastNameInput.value = user.lastName;
                passwordInput.value = user.password;
                const toggle = document.getElementById("ToggleEditPassword");
                const input = document.getElementById("FormEditUserPassword");
                toggle?.addEventListener("click", () => {
                    const icon = toggle.querySelector("i");
                    if (input.type === "password") {
                        input.type = "text";
                        icon?.classList.remove("bi-eye");
                        icon?.classList.add("bi-eye-slash");
                    }
                    else {
                        input.type = "password";
                        icon?.classList.remove("bi-eye-slash");
                        icon?.classList.add("bi-eye");
                    }
                });
                document.getElementById("FormEditUserCancel").addEventListener("click", async () => {
                    await this.loadPage();
                });
                document.getElementById("FormEditUserSubmit").addEventListener("click", async () => {
                    const editForm = document.getElementById("FormEditUser");
                    const username = document.getElementById("FormEditUserUsername").value.trim();
                    const password = document.getElementById("FormEditUserPassword").value.trim();
                    const firstName = document.getElementById("FormEditUserFirstName").value.trim();
                    const lastName = document.getElementById("FormEditUserLastName").value.trim();
                    if (!username || !password) {
                        this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                        return;
                    }
                    const success = await this.appManager.editUser(username, firstName, lastName, password);
                    if (success) {
                        this.showToast("User erfolgreich geändert.", true);
                        editForm.reset();
                        await this.loadPage();
                    }
                    else {
                        this.showToast("User ID existiert nicht.", false);
                    }
                });
            });
        });
    }
}
//# sourceMappingURL=UserManagementPagePOM.js.map