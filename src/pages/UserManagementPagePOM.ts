import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class UserManagementPagePOM extends AbstractPOM {
    constructor(private appManager: ApplicationManager) {
        super();
    }

    async showPage(): Promise<void> {
    this.clearPageContent();

    const container = document.createElement("div");
    container.id = "UserManagementPage";

  
    container.innerHTML = `
  <div class="container mt-5">
    <h1 class="mb-4">User Management</h1>
    <button class="btn btn-primary mb-4" id="ButtonAddUser">Benutzer hinzufügen</button>
    <table class="table table-bordered mt-3" id="TableUsers">
      <thead>
        <tr>
          <th>User-ID</th>
          <th>Firstname</th>
          <th>Lastname</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="UserTableBody">
      </tbody>
    </table>
  </div>
    `;

    document.getElementById("PageContent")?.appendChild(container);

    const users = await this.appManager.getUsers();
    console.log("Users:", users);
    const tbody = container.querySelector("#UserTableBody");

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
        editButton.className = "btn btn-success";
        editButton.id = `${user.userID}TableItemEditButton`;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.id = `${user.userID}TableItemDeleteButton`;
        deleteButton.textContent = "Delete";

        tdActions.appendChild(editButton);
        tdActions.appendChild(deleteButton);

        row.appendChild(tdUserID);
        row.appendChild(tdFirstName);
        row.appendChild(tdLastName);
        row.appendChild(tdActions);

        tbody?.appendChild(row);
    });
}
}