import { AbstractPOM } from "./AbstractPOM.js";
export class UserManagementPagePOM extends AbstractPOM {
    appManager;
    addButton;
    deleteButtons = new Map();
    editButtons = new Map();
    // Listener-Refs, damit wir sie beim unload entfernen können
    addButtonListener;
    deleteButtonListeners = new Map();
    editButtonListeners = new Map();
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        // Seite laden
        await AbstractPOM.showPage("./html/user-management.html");
        // Tabelle leeren
        const tbody = document.getElementById("UserTableBody");
        if (!tbody)
            return;
        tbody.innerHTML = "";
        const users = await this.appManager.getUsers();
        // Buttons vorher zurücksetzen (falls reload)
        this.deleteButtons.clear();
        this.editButtons.clear();
        this.deleteButtonListeners.clear();
        this.editButtonListeners.clear();
        // Tabelle befüllen
        users.forEach(user => {
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
            tdActions.appendChild(editButton);
            tdActions.appendChild(deleteButton);
            row.appendChild(tdUserID);
            row.appendChild(tdFirstName);
            row.appendChild(tdLastName);
            row.appendChild(tdActions);
            tbody.appendChild(row);
            // Speichern für späteres Entfernen der Listener
            this.deleteButtons.set(user.userID, deleteButton);
            this.editButtons.set(user.userID, editButton);
        });
        // Add-User Button holen (nur einmal)
        this.addButton = document.getElementById("ButtonAddUser");
        // Listener registrieren (vorher evtl. alte entfernen)
        this.registerEventListeners(users);
    }
    registerEventListeners(users) {
        // Delete Buttons
        this.deleteButtons.forEach((btn, userID) => {
            // Listener Funktion
            const deleteListener = async () => {
                await this.appManager.deleteUser(userID);
                await this.loadPage();
            };
            // Alte Listener entfernen, falls vorhanden
            const oldListener = this.deleteButtonListeners.get(userID);
            if (oldListener)
                btn.removeEventListener("click", oldListener);
            btn.addEventListener("click", deleteListener);
            this.deleteButtonListeners.set(userID, deleteListener);
        });
        // Edit Buttons
        this.editButtons.forEach((btn, userID) => {
            // Listener Funktion
            const editListener = () => {
                this.showEditUserForm(userID);
            };
            const oldListener = this.editButtonListeners.get(userID);
            if (oldListener)
                btn.removeEventListener("click", oldListener);
            btn.addEventListener("click", editListener);
            this.editButtonListeners.set(userID, editListener);
        });
        // Add User Button
        if (this.addButton) {
            // Alten Listener entfernen, falls vorhanden
            if (this.addButtonListener) {
                this.addButton.removeEventListener("click", this.addButtonListener);
            }
            this.addButtonListener = () => this.showAddUserForm();
            this.addButton.addEventListener("click", this.addButtonListener);
        }
    }
    showAddUserForm() {
        const pageContent = document.getElementById("UserManagementPage");
        if (!pageContent)
            return;
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
        // Passwort-Toggle
        const toggle = document.getElementById("ToggleSignupPassword");
        const input = document.getElementById("FormAddUserPassword");
        const toggleHandler = () => {
            const icon = toggle?.querySelector("i");
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
        };
        toggle?.addEventListener("click", toggleHandler);
        // Cancel Button
        const cancelBtn = document.getElementById("FormAddUserCancel");
        cancelBtn?.addEventListener("click", async () => {
            await this.loadPage();
        });
        // Submit Button
        const submitBtn = document.getElementById("FormAddUserSubmit");
        submitBtn?.addEventListener("click", async () => {
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
                await this.loadPage();
            }
            else {
                this.showToast("User ID existiert bereits.", false);
            }
        });
    }
    async showEditUserForm(userID) {
        const user = (await this.appManager.getUsers()).find(u => u.userID === userID);
        if (!user) {
            this.showToast("User nicht gefunden.", false);
            return;
        }
        const pageContent = document.getElementById("UserManagementPage");
        if (!pageContent)
            return;
        pageContent.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
          <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
            <form id="FormEditUser" style="display:block;">
              <h3 class="text-center mb-3">Nutzer bearbeiten</h3>
              <div class="mb-3">
                <input id="FormEditUserUsername" type="text" class="form-control" placeholder="User ID" readonly>
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
        // Formularwerte setzen
        document.getElementById("FormEditUserUsername").value = user.userID;
        document.getElementById("FormEditUserFirstName").value = user.firstName;
        document.getElementById("FormEditUserLastName").value = user.lastName;
        // Password leer lassen, user.password soll nicht im Klartext da sein!
        // Passwort-Toggle
        const toggle = document.getElementById("ToggleEditPassword");
        const input = document.getElementById("FormEditUserPassword");
        const toggleHandler = () => {
            const icon = toggle?.querySelector("i");
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
        };
        toggle?.addEventListener("click", toggleHandler);
        // Cancel Button
        const cancelBtn = document.getElementById("FormEditUserCancel");
        cancelBtn?.addEventListener("click", async () => {
            await this.loadPage();
        });
        // Submit Button
        const submitBtn = document.getElementById("FormEditUserSubmit");
        submitBtn?.addEventListener("click", async () => {
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
                this.showToast("User erfolgreich aktualisiert.", true);
                await this.loadPage();
            }
            else {
                this.showToast("Fehler beim Aktualisieren.", false);
            }
        });
    }
    // Diese Funktion zum Aufräumen, wenn Seite verlassen wird
    async unloadPage() {
        // Delete Button Listener entfernen
        this.deleteButtons.forEach((btn, userID) => {
            const listener = this.deleteButtonListeners.get(userID);
            if (listener)
                btn.removeEventListener("click", listener);
        });
        this.deleteButtonListeners.clear();
        this.deleteButtons.clear();
        // Edit Button Listener entfernen
        this.editButtons.forEach((btn, userID) => {
            const listener = this.editButtonListeners.get(userID);
            if (listener)
                btn.removeEventListener("click", listener);
        });
        this.editButtonListeners.clear();
        this.editButtons.clear();
        // Add Button Listener entfernen
        if (this.addButton && this.addButtonListener) {
            this.addButton.removeEventListener("click", this.addButtonListener);
            this.addButtonListener = undefined;
        }
        // Inhalt leeren
        const pageContent = document.getElementById("UserManagementPage");
        if (pageContent)
            pageContent.innerHTML = "";
    }
}
//# sourceMappingURL=UserManagementPagePOM.js.map