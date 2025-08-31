import { AbstractPOM } from "./AbstractPOM.js";
export class BackupsPagePOM extends AbstractPOM {
    appManager;
    currentPath = [];
    // Navbar Listener-Handler als Properties
    linkRootClickHandler = () => {
        if (this.appManager.isLoggedIn())
            this.appManager.loadStartPage();
        else
            this.appManager.loadLandingPage();
    };
    linkImpressumClickHandler = () => {
        this.appManager.loadImpressumPage();
    };
    linkUserManagementClickHandler = (e) => {
        e.preventDefault();
        this.appManager.loadUserManagementPage();
    };
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/backups.html");
        // Navbar Listener anhängen
        document.getElementById("LinkRoot")?.addEventListener("click", this.linkRootClickHandler);
        document.getElementById("LinkImpressum")?.addEventListener("click", this.linkImpressumClickHandler);
        document.getElementById("LinkUserManagement")?.addEventListener("click", this.linkUserManagementClickHandler);
        // Zugriff prüfen
        if (this.appManager.loggedInUser?.role !== "admin" && this.appManager.loggedInUser?.role !== "manager") {
            alert("Zugriff verweigert");
            this.appManager.loadStartPage();
            return;
        }
        this.loadBackupList();
    }
    async unloadPage() {
        // Navbar Listener entfernen
        document.getElementById("LinkRoot")?.removeEventListener("click", this.linkRootClickHandler);
        document.getElementById("LinkImpressum")?.removeEventListener("click", this.linkImpressumClickHandler);
        document.getElementById("LinkUserManagement")?.removeEventListener("click", this.linkUserManagementClickHandler);
        // Pfad und Container zurücksetzen
        this.currentPath = [];
        const container = document.getElementById("backup-list");
        if (container)
            container.innerHTML = "";
    }
    // --- Backup List Methoden bleiben unverändert ---
    async loadBackupList() {
        const path = this.currentPath.join("/");
        const res = await fetch(`/api/backup/list?path=${encodeURIComponent(path)}`);
        const container = document.getElementById("backup-list");
        if (!res.ok) {
            container.innerHTML = "<p>Fehler beim Laden der Backups.</p>";
            return;
        }
        const data = await res.json();
        const visiblePath = path ? `/minecraft_backups/${path}` : "/minecraft_backups";
        container.innerHTML = `
            <h3 style="margin-bottom: 10px;">📁 ${visiblePath}</h3>
            <hr style="border: 1px solid #ccc; margin-bottom: 20px;">
        `;
        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";
        if (this.currentPath.length > 0) {
            const back = document.createElement("li");
            back.textContent = "⬅️ ..";
            back.style.cursor = "pointer";
            back.style.padding = "6px 10px";
            back.style.fontWeight = "bold";
            back.style.color = "rgba(255,255,255,1)";
            back.onmouseenter = () => (back.style.textDecoration = "underline");
            back.onmouseleave = () => (back.style.textDecoration = "none");
            back.onclick = () => {
                this.currentPath.pop();
                this.loadBackupList();
            };
            ul.appendChild(back);
        }
        for (const item of data.entries) {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.padding = "6px 10px";
            li.style.borderBottom = "1px solid #eee";
            const nameSpan = document.createElement("span");
            nameSpan.textContent = item.name;
            nameSpan.style.cursor = item.isDirectory ? "pointer" : "default";
            nameSpan.style.color = "rgba(255,255,255,1)";
            nameSpan.style.fontWeight = item.isDirectory ? "bold" : "normal";
            if (item.isDirectory) {
                nameSpan.onclick = () => {
                    this.currentPath.push(item.name);
                    this.loadBackupList();
                };
            }
            li.appendChild(nameSpan);
            if (!item.isDirectory) {
                const buttonGroup = document.createElement("div");
                buttonGroup.style.display = "flex";
                buttonGroup.style.gap = "8px";
                if (item.name.endsWith(".log")) {
                    const viewBtn = document.createElement("button");
                    viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
                    viewBtn.title = "Anzeigen";
                    viewBtn.style.background = "transparent";
                    viewBtn.style.border = "none";
                    viewBtn.style.color = "white";
                    viewBtn.style.cursor = "pointer";
                    viewBtn.onclick = (e) => {
                        e.stopPropagation();
                        const fullPath = [...this.currentPath, item.name].join("/");
                        window.open(`/api/backup/view?path=${encodeURIComponent(fullPath)}`, "_blank");
                    };
                    buttonGroup.appendChild(viewBtn);
                }
                const btn = document.createElement("button");
                btn.textContent = "Download";
                btn.style.padding = "4px 10px";
                btn.style.backgroundColor = "#0a5500";
                btn.style.color = "white";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.cursor = "pointer";
                btn.onmouseenter = () => (btn.style.backgroundColor = "#0f8500ff");
                btn.onmouseleave = () => (btn.style.backgroundColor = "#0a5500");
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const fullPath = [...this.currentPath, item.name].join("/");
                    window.open(`/api/backup/download?path=${encodeURIComponent(fullPath)}`, "_blank");
                };
                buttonGroup.appendChild(btn);
                li.appendChild(buttonGroup);
            }
            ul.appendChild(li);
        }
        container.appendChild(ul);
    }
    formatFileSize(size) {
        const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        return (size / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }
}
//# sourceMappingURL=BackupsPagePOM.js.map