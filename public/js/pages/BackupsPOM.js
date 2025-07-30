import { AbstractPOM } from "./AbstractPOM.js";
export class BackupsPagePOM extends AbstractPOM {
    appManager;
    currentPath = [];
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/backups.html");
        // Navigationslinks
        document.getElementById("LinkRoot").addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
        });
        document.getElementById("LinkImpressum").addEventListener("click", () => {
            this.appManager.loadImpressumPage();
        });
        document.getElementById("LinkUserManagement")?.addEventListener("click", () => {
            this.appManager.loadUserManagementPage();
        });
        // Nur Admins und Manager dürfen hierher kommen
        if (this.appManager.loggedInUser?.role !== "admin" && this.appManager.loggedInUser?.role !== "manager") {
            alert("Zugriff verweigert");
            this.appManager.loadStartPage();
            return;
        }
        this.loadBackupList();
    }
    async loadBackupList() {
        const path = this.currentPath.join("/");
        const res = await fetch(`/api/backup/list?path=${encodeURIComponent(path)}`);
        if (!res.ok) {
            document.getElementById("backup-list").innerHTML = "<p>Fehler beim Laden der Backups.</p>";
            return;
        }
        const data = await res.json();
        const container = document.getElementById("backup-list");
        const visiblePath = path ? `/minecraft_backups/${path}` : "/minecraft_backups";
        container.innerHTML = `
        <h3 style="margin-bottom: 10px;">📁 ${visiblePath}</h3>
        <hr style="border: 1px solid #ccc; margin-bottom: 20px;">
        `;
        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";
        // Zurück-Link (..)
        if (this.currentPath.length > 0) {
            const back = document.createElement("li");
            back.textContent = "⬅️ ..";
            back.classList.add("directory");
            back.style.cursor = "pointer";
            back.style.padding = "6px 10px";
            back.style.fontWeight = "bold";
            back.style.color = "#ffffffff";
            back.onmouseenter = () => back.style.textDecoration = "underline";
            back.onmouseleave = () => back.style.textDecoration = "none";
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
            nameSpan.style.color = item.isDirectory ? "#ffffff" : "#dddddd";
            nameSpan.style.fontWeight = item.isDirectory ? "bold" : "normal";
            nameSpan.onmouseenter = () => {
                if (item.isDirectory)
                    nameSpan.style.textDecoration = "underline";
            };
            nameSpan.onmouseleave = () => {
                if (item.isDirectory)
                    nameSpan.style.textDecoration = "none";
            };
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
                // 🔍 Optionaler "Anzeigen"-Button für .log-Dateien
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
                // ⬇️ Download Button
                const btn = document.createElement("button");
                btn.textContent = "Download";
                btn.style.padding = "4px 10px";
                btn.style.backgroundColor = "#0a5500";
                btn.style.color = "white";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.cursor = "pointer";
                btn.onmouseenter = () => btn.style.backgroundColor = "#0f8500ff";
                btn.onmouseleave = () => btn.style.backgroundColor = "#0a5500";
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
}
//# sourceMappingURL=BackupsPOM.js.map