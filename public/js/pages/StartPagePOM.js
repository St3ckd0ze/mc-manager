import { AbstractPOM } from "./AbstractPOM.js";
export class StartPagePOM extends AbstractPOM {
    appManager;
    listenersSet = false;
    tmuxUpdateIntervalId = null;
    tmuxCommandInput;
    tmuxCommandSend;
    // Navbar-Listener Referenzen
    linkRootListener;
    linkImpressumListener;
    linkUserManagementListener;
    linkBackupListener;
    // Tmux-Listener
    tmuxClickListener;
    tmuxEnterListener;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage(`./html/start.html`);
        const user = this.appManager.getLoggedInUser();
        const isPrivilegedUser = user?.role === "admin" || user?.role === "manager";
        if (!this.listenersSet) {
            this.bindNavbarListeners();
            this.listenersSet = true;
        }
        const playersContainer = document.getElementById("OnlinePlayersContainer");
        if (playersContainer) {
            const updatePlayers = async () => {
                try {
                    // 1. Alle Spieler aus /api/mc/players holen
                    const res = await fetch("/api/mc/players");
                    if (!res.ok)
                        throw new Error("Fehler beim Abrufen der Spieler");
                    const players = await res.json();
                    // 2. Sortieren: Online Spieler zuerst
                    players.sort((a, b) => {
                        if (a.online === b.online)
                            return a.name.localeCompare(b.name);
                        return a.online ? -1 : 1;
                    });
                    // 3. UI bauen
                    playersContainer.innerHTML = "";
                    playersContainer.style.display = "flex";
                    playersContainer.style.flexWrap = "wrap";
                    playersContainer.style.gap = "1rem";
                    playersContainer.style.padding = "10px";
                    playersContainer.style.backgroundColor = "white";
                    playersContainer.style.border = "1px solid #ccc";
                    playersContainer.style.borderRadius = "8px";
                    playersContainer.style.justifyContent = "flex-start";
                    players.forEach(player => {
                        const div = document.createElement("div");
                        div.className = "player-card";
                        div.style.position = "relative";
                        div.style.textAlign = "center";
                        div.style.width = "70px";
                        div.style.cursor = "pointer";
                        const img = document.createElement("img");
                        img.src = `https://minotar.net/helm/${player.name}/64.png`;
                        img.alt = player.name;
                        img.className = "player-head";
                        img.style.width = "64px";
                        img.style.height = "64px";
                        img.style.filter = player.online ? "none" : "grayscale(100%)";
                        div.appendChild(img);
                        const statusDot = document.createElement("div");
                        statusDot.style.position = "absolute";
                        statusDot.style.width = "16px";
                        statusDot.style.height = "16px";
                        statusDot.style.borderRadius = "50%";
                        statusDot.style.border = "2px solid white";
                        statusDot.style.bottom = "0";
                        statusDot.style.right = "0";
                        statusDot.style.transform = "translate(40%, -90%)";
                        statusDot.style.backgroundColor = player.online ? "limegreen" : "gray";
                        div.appendChild(statusDot);
                        const label = document.createElement("div");
                        label.textContent = player.name;
                        label.className = "player-name";
                        label.style.fontSize = "0.75rem";
                        label.style.marginTop = "0.25rem";
                        div.appendChild(label);
                        playersContainer.appendChild(div);
                        div.addEventListener("click", async () => {
                            await this.appManager.loadPlayerDataPage(player.name);
                        });
                    });
                }
                catch (err) {
                    console.error("Fehler beim Laden der Spielerübersicht:", err);
                }
            };
            await updatePlayers();
            setInterval(updatePlayers, 10000);
        }
        // Tmux-Container anzeigen/verbergen
        const tmuxContainer = document.getElementById("TmuxConsoleContainer");
        if (tmuxContainer) {
            tmuxContainer.style.display = (user?.role === "user") ? "none" : "flex";
        }
        const tmuxOutput = document.getElementById("TmuxConsoleOutput");
        if (isPrivilegedUser) {
            this.tmuxCommandInput = document.getElementById("TmuxCommandInput");
            this.tmuxCommandSend = document.getElementById("TmuxCommandSend");
            this.tmuxClickListener = async () => {
                const command = this.tmuxCommandInput?.value.trim() ?? "";
                if (!command)
                    return;
                await this.appManager.sendTmuxCommand(command);
                this.tmuxCommandInput.value = "";
                await updateTmuxOutput();
            };
            this.tmuxEnterListener = async (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    await this.tmuxClickListener();
                }
            };
            this.tmuxCommandSend.addEventListener("click", this.tmuxClickListener);
            this.tmuxCommandInput.addEventListener("keydown", this.tmuxEnterListener);
        }
        else {
            document.getElementById("TmuxCommandInput")?.setAttribute("style", "display:none");
            document.getElementById("TmuxCommandSend")?.setAttribute("style", "display:none");
        }
        const updateTmuxOutput = async () => {
            if (!tmuxOutput)
                return;
            const isScrolledToBottom = (tmuxOutput.scrollHeight - tmuxOutput.clientHeight - tmuxOutput.scrollTop) < 20;
            const output = await this.appManager.getTmuxOutput();
            tmuxOutput.textContent = output;
            if (isScrolledToBottom)
                tmuxOutput.scrollTop = tmuxOutput.scrollHeight;
        };
        await updateTmuxOutput();
        if (this.tmuxUpdateIntervalId === null) {
            this.tmuxUpdateIntervalId = window.setInterval(updateTmuxOutput, 3000);
        }
    }
    bindNavbarListeners() {
        this.linkRootListener = () => {
            if (this.appManager.isLoggedIn())
                this.appManager.loadStartPage();
            else
                this.appManager.loadLandingPage();
        };
        document.getElementById("LinkRoot")?.addEventListener("click", this.linkRootListener);
        this.linkImpressumListener = () => this.appManager.loadImpressumPage();
        document.getElementById("LinkImpressum")?.addEventListener("click", this.linkImpressumListener);
        this.linkUserManagementListener = (e) => {
            e.preventDefault();
            this.appManager.loadUserManagementPage();
        };
        document.getElementById("LinkUserManagement")?.addEventListener("click", this.linkUserManagementListener);
        this.linkBackupListener = (e) => {
            e.preventDefault();
            this.appManager.loadBackupsPage();
        };
        document.getElementById("nav-backup")?.addEventListener("click", this.linkBackupListener);
    }
    async unloadPage() {
        if (this.tmuxUpdateIntervalId !== null) {
            clearInterval(this.tmuxUpdateIntervalId);
            this.tmuxUpdateIntervalId = null;
        }
        this.linkRootListener && document.getElementById("LinkRoot")?.removeEventListener("click", this.linkRootListener);
        this.linkImpressumListener && document.getElementById("LinkImpressum")?.removeEventListener("click", this.linkImpressumListener);
        this.linkUserManagementListener && document.getElementById("LinkUserManagement")?.removeEventListener("click", this.linkUserManagementListener);
        this.linkBackupListener && document.getElementById("nav-backup")?.removeEventListener("click", this.linkBackupListener);
        if (this.tmuxCommandSend && this.tmuxClickListener) {
            this.tmuxCommandSend.removeEventListener("click", this.tmuxClickListener);
        }
        if (this.tmuxCommandInput && this.tmuxEnterListener) {
            this.tmuxCommandInput.removeEventListener("keydown", this.tmuxEnterListener);
        }
        this.listenersSet = false;
        this.clearPageContent();
    }
}
//# sourceMappingURL=StartPagePOM.js.map