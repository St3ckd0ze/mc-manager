import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class StartPagePOM extends AbstractPOM {
    private listenersSet = false;
    private tmuxUpdateIntervalId: number | null = null;

    constructor(private appManager: ApplicationManager) {
        super();
    }

    async loadPage(): Promise<void> {
        await AbstractPOM.showPage(`./html/start.html`);

        const user = this.appManager.getLoggedInUser();
    
        // Spieleranzeige
        const playersContainer = document.getElementById("OnlinePlayersContainer");
        if (playersContainer) {
            const updatePlayers = async () => {
                try {
                    const res = await fetch("/api/mc/players");
                    if (!res.ok) throw new Error("Fehler beim Abrufen der Spieler");
                    const players = await res.json() as { name: string, online: boolean }[];

                    playersContainer.innerHTML = "";

                    players.forEach(player => {
                        const div = document.createElement("div");
                        div.className = "player-card";

                        const img = document.createElement("img");
                        // Minecraft-Head via Minotar.net
                        img.src = `https://minotar.net/helm/${player.name}/64.png`;
                        img.alt = player.name;
                        img.className = "player-head";
                        if (!player.online) {
                            img.style.filter = "grayscale(100%)";
                        }

                        const label = document.createElement("div");
                        label.textContent = player.name;
                        label.className = "player-name";

                        div.appendChild(img);
                        div.appendChild(label);
                        playersContainer.appendChild(div);
                    });
                } catch (err) {
                    console.error("Fehler beim Laden der Spielerübersicht:", err);
                }
            };

            // Sofort laden
            await updatePlayers();
            // Alle 10 Sekunden updaten
            setInterval(updatePlayers, 10000);
        }


        const tmuxContainer = document.getElementById("TmuxConsoleContainer");
        if (tmuxContainer) {
            if (user?.role === "user") {
                tmuxContainer.style.display = "none";
            } else {
                tmuxContainer.style.display = "flex";
            }
        }

        const tmuxOutput = document.getElementById("TmuxConsoleOutput") as HTMLPreElement;
        const isPrivilegedUser = user?.role === "admin" || user?.role === "manager";

        let tmuxCommandInput: HTMLInputElement | null = null;
        let tmuxCommandSend: HTMLButtonElement | null = null;

        if (isPrivilegedUser) {
            tmuxCommandInput = document.getElementById("TmuxCommandInput") as HTMLInputElement;
            tmuxCommandSend = document.getElementById("TmuxCommandSend") as HTMLButtonElement;
        } else {
            const inputEl = document.getElementById("TmuxCommandInput");
            if (inputEl) inputEl.style.display = "none";
            const sendBtnEl = document.getElementById("TmuxCommandSend");
            if (sendBtnEl) sendBtnEl.style.display = "none";
        }

        const updateTmuxOutput = async () => {
            if (!tmuxOutput) return;
            const isScrolledToBottom = (tmuxOutput.scrollHeight - tmuxOutput.clientHeight - tmuxOutput.scrollTop) < 20;
            const output = await this.appManager.getTmuxOutput();
            tmuxOutput.textContent = output;
            if (isScrolledToBottom) {
                tmuxOutput.scrollTop = tmuxOutput.scrollHeight;
            }
        };

        await updateTmuxOutput();

        if (this.tmuxUpdateIntervalId === null) {
            this.tmuxUpdateIntervalId = window.setInterval(updateTmuxOutput, 3000);
        }

        if (!this.listenersSet) {
            tmuxCommandSend?.addEventListener("click", async () => {
                const command = tmuxCommandInput?.value.trim() ?? "";
                if (command.length === 0) return;
                await this.appManager.sendTmuxCommand(command);
                if (tmuxCommandInput) tmuxCommandInput.value = "";
                await updateTmuxOutput();
            });

            tmuxCommandInput?.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    tmuxCommandSend?.click();
                }
            });

            document.getElementById("LinkLogout")!.addEventListener("click", () => {
                this.appManager.logout();
                this.appManager.loadLandingPage();
            });

            document.getElementById("LinkImpressum")!.addEventListener("click", () => {
                this.appManager.loadImpressumPage();
            });

            document.getElementById("LinkUserManagement")?.addEventListener("click", (e) => {
                e.preventDefault();
                this.appManager.loadUserManagementPage();
            });

            document.getElementById("nav-backup")?.addEventListener("click", (e) => {
                e.preventDefault();
                this.appManager.loadBackupsPage();
            });

            this.listenersSet = true;
        }
    }

    async unloadPage(): Promise<void> {
        // ⛔ Intervall stoppen
        if (this.tmuxUpdateIntervalId !== null) {
            clearInterval(this.tmuxUpdateIntervalId);
            this.tmuxUpdateIntervalId = null;
        }

        // ✅ zurücksetzen
        this.listenersSet = false;

        // 🧹 optional: Inhalte löschen, falls nötig
        this.clearPageContent();
    }
}
