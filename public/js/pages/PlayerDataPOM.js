import { AbstractPOM } from "./AbstractPOM.js";
export class PlayerDataPOM extends AbstractPOM {
    appManager;
    statsData = [];
    filteredData = [];
    currentPage = 1;
    itemsPerPage = 25;
    // Navbar Listener
    linkRootListener;
    linkImpressumListener;
    linkUserManagementListener;
    listenersSet = false;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage("./html/players.html");
        // Navbar-Listener nur einmal setzen
        if (!this.listenersSet) {
            this.bindNavbarListeners();
            this.listenersSet = true;
        }
        const playerName = this.appManager.currentPlayerName;
        if (!playerName)
            return;
        const header = document.getElementById("PlayerNameHeader");
        if (header)
            header.textContent = playerName;
        try {
            const res = await fetch(`/api/mc/stats/${playerName}`);
            if (!res.ok)
                throw new Error("Fehler beim Abrufen der Spieler-Daten");
            const data = await res.json();
            const stats = data.stats["minecraft:killed"];
            this.statsData = Object.entries(stats).map(([name, value]) => ({
                name: this.formatMobName(name),
                value: Number(value),
            }));
            this.filteredData = [...this.statsData];
            this.renderBaseTable(); // Grundgerüst
            this.renderTableBody(); // nur tbody
            this.renderPagination();
            // Live-Suche einmalig binden
            const filterInput = document.getElementById("statsFilter");
            if (filterInput) {
                filterInput.addEventListener("input", () => {
                    this.currentPage = 1;
                    this.applyFilter(filterInput.value);
                    this.renderTableBody();
                    this.renderPagination();
                });
            }
        }
        catch (err) {
            console.error("Fehler beim Laden der Spieler-Daten:", err);
            this.showToast("Fehler beim Laden der Spieler-Daten", false);
        }
    }
    bindNavbarListeners() {
        // LinkRoot
        if (!this.linkRootListener) {
            this.linkRootListener = (e) => {
                e.preventDefault();
                if (this.appManager.isLoggedIn())
                    this.appManager.loadStartPage();
                else
                    this.appManager.loadLandingPage();
            };
        }
        const rootEl = document.getElementById("LinkRoot");
        if (rootEl) {
            rootEl.removeEventListener("click", this.linkRootListener);
            rootEl.addEventListener("click", this.linkRootListener);
        }
        // Impressum
        if (!this.linkImpressumListener) {
            this.linkImpressumListener = (e) => {
                e.preventDefault();
                this.appManager.loadImpressumPage();
            };
        }
        const impressumEl = document.getElementById("LinkImpressum");
        if (impressumEl) {
            impressumEl.removeEventListener("click", this.linkImpressumListener);
            impressumEl.addEventListener("click", this.linkImpressumListener);
        }
        // User Management
        if (!this.linkUserManagementListener) {
            this.linkUserManagementListener = (e) => {
                e.preventDefault();
                this.appManager.loadUserManagementPage();
            };
        }
        const userMgmtEl = document.getElementById("LinkUserManagement");
        if (userMgmtEl) {
            userMgmtEl.removeEventListener("click", this.linkUserManagementListener);
            userMgmtEl.addEventListener("click", this.linkUserManagementListener);
        }
    }
    formatMobName(name) {
        return name.replace(/^minecraft:/, '')
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }
    renderBaseTable() {
        const container = document.getElementById("PlayerStatsContainer");
        if (!container)
            return;
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover table-striped align-middle fw-bold mb-0" 
                       style="border-radius: 0.5rem; overflow: hidden;">
                    <thead class="table-dark">
                        <tr>
                            <th colspan="2" class="p-1">
                                <input type="text" id="statsFilter" 
                                    class="form-control form-control-sm" 
                                    placeholder="Filter..."
                                    style="margin:0; padding:0.25rem 0.5rem; font-size:0.9rem;"/>
                            </th>
                        </tr>
                        <tr>
                            <th>Mob</th>
                            <th>Anzahl</th>
                        </tr>
                    </thead>
                    <tbody id="statsTableBody"></tbody>
                </table>
            </div>
            <div id="statsPagination" class="mt-1"></div>
        `;
    }
    renderTableBody() {
        const body = document.getElementById("statsTableBody");
        if (!body)
            return;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredData.slice(start, end);
        body.innerHTML = pageItems.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.value}</td>
            </tr>
        `).join('');
    }
    applyFilter(filter) {
        const f = filter.toLowerCase();
        this.filteredData = this.statsData.filter(s => s.name.toLowerCase().includes(f));
    }
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const paginationContainer = document.getElementById("statsPagination");
        if (!paginationContainer)
            return;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="btn btn-sm me-1"
                            style="
                                background-color: ${i === this.currentPage ? '#999999ff' : 'white'};
                                color: black;
                                border: 1px solid #ccc;
                            "
                            data-page="${i}">${i}</button>`;
        }
        paginationContainer.innerHTML = html;
        paginationContainer.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                this.currentPage = page;
                this.renderTableBody();
                this.renderPagination();
            });
        });
    }
    async unloadPage() {
        // Navbar Listener entfernen
        if (this.linkRootListener)
            document.getElementById("LinkRoot")?.removeEventListener("click", this.linkRootListener);
        if (this.linkImpressumListener)
            document.getElementById("LinkImpressum")?.removeEventListener("click", this.linkImpressumListener);
        if (this.linkUserManagementListener)
            document.getElementById("LinkUserManagement")?.removeEventListener("click", this.linkUserManagementListener);
        this.clearPageContent();
    }
}
//# sourceMappingURL=PlayerDataPOM.js.map