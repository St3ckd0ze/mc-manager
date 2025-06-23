import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class UserManagementPagePOM extends AbstractPOM {
    constructor(private appManager: ApplicationManager) {
        super();
    }

    async loadPage(): Promise<void> {
      
    await AbstractPOM.showPage("./html/user-management.html");

    this.clearPageContent();
    const filterContainer = document.getElementById("FilterUserContainer");
    if (filterContainer) {
      filterContainer.innerHTML = `
        <input type="text" id="UserFilterInput" class="form-control d-inline w-auto me-2" placeholder="User ID filtern">
        <button type="button" id="UserFilterButton" class="btn btn-primary">Filtern</button>
      `;
}

    const users = await this.appManager.getUsers();
    const tbody = document.getElementById("UserTableBody");
    if (tbody) tbody.innerHTML = "";

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

        const addButton = document.getElementById("ButtonAddUser")

        tdActions.appendChild(editButton);
        tdActions.appendChild(deleteButton);

        row.appendChild(tdUserID);
        row.appendChild(tdFirstName);
        row.appendChild(tdLastName);
        row.appendChild(tdActions);
        tbody?.appendChild(row);

        deleteButton.addEventListener("click", async () =>  {
            await this.appManager.deleteUser(user.userID);
            await this.loadPage();
        });

        addButton?.addEventListener("click", async () =>  {

            const pageContent = document.getElementById("pageContent")
            if(pageContent) pageContent.innerHTML = `
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>User-Management - WE-1 SPA</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
              <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"></script>
            </head>
            <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;" id="pageContent">
            <div class="card shadow p-4" style="min-width: 300px; max-width: 400px; width: 100%;">
            <form id="FormSignup" style="display:block;">
              <h3 class="text-center mb-3">Nutzer hinzufügen</h3>
              <div class="mb-3">
                <input id="FormSignupUsername" type="text" class="form-control" placeholder="User ID">
              </div>
              <div class="mb-3">
              <div class="input-group">
                <input id="FormSignupPassword" type="password" class="form-control" placeholder="Password">
                <span class="input-group-text" id="ToggleSignupPassword" style="cursor: pointer;">
                  <i class="bi bi-eye"></i>
                </span>
              </div>
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
                <a href="#" id="SignUpPageLinkUserManagement">Zurück zum User Management</a>
              </div>
              </form>
              </div>
              </div>`

              
                const toggle = document.getElementById("ToggleSignupPassword");
                const input = document.getElementById("FormSignupPassword") as HTMLInputElement;

                toggle?.addEventListener("click", () => {
                  const icon = toggle.querySelector("i");
                  if (input.type === "password") {
                    input.type = "text";
                    icon?.classList.remove("bi-eye");
                    icon?.classList.add("bi-eye-slash");
                  } else {
                    input.type = "password";
                    icon?.classList.remove("bi-eye-slash");
                    icon?.classList.add("bi-eye");
                  }
                });
            
                document.getElementById("SignUpPageLinkUserManagement")!.addEventListener("click", async () => {
                    await this.loadPage();
                });
            
            

                document.getElementById("ButtonSignupUser")!.addEventListener("click", async () => {

                const signupForm = document.getElementById("FormSignup") as HTMLFormElement;
                const username = (document.getElementById("FormSignupUsername") as HTMLInputElement).value.trim();
                const password = (document.getElementById("FormSignupPassword") as HTMLInputElement).value.trim();
                const firstName = (document.getElementById("FormSignupFirstName") as HTMLInputElement).value.trim();
                const lastName = (document.getElementById("FormSignupLastName") as HTMLInputElement).value.trim();

                if (!username || !password) {
                    this.showToast("User ID und Passwort dürfen nicht leer sein.", false);
                    return;
                }


                
                if(password.length < 7) {
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
        
            });

        });

    const filterButton = document.getElementById("UserFilterButton");

    filterButton?.addEventListener("click", async () => {
      const filterInput = (document.getElementById("UserFilterInput") as HTMLInputElement).value.trim().toLowerCase();
      const filteredUsers = (await this.appManager.getUsers())
        .filter(u => u.userID.toLowerCase().includes(filterInput))
        .sort((a, b) => a.userID.localeCompare(b.userID));

      const tbody = document.getElementById("UserTableBody");
      if (tbody) tbody.innerHTML = "";

      filteredUsers.forEach((user) => {
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
        tbody?.appendChild(row);

        deleteButton.addEventListener("click", async () => {
          await this.appManager.deleteUser(user.userID);
          await this.loadPage();
        });
      });
    });

        
    }


}