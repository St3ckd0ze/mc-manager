import { AbstractPOM } from "./AbstractPOM.js";
export class StartPagePOM extends AbstractPOM {
    appManager;
    listenersSet = false;
    tmuxUpdateIntervalId = null; // Intervall-ID speichern
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage(`./html/start.html`);
        // Begrüßung etc.
        const user = this.appManager.getLoggedInUser();
        const userCount = await this.appManager.getUserCount();
        const greeting = user ? `${user.firstName} ${user.lastName}` : "Guest";
        const verb = userCount === 1 ? "ist" : "sind";
        const greetingSpan = document.getElementById("Greeting");
        const verbSpan = document.getElementById("Verb");
        const userCountSpan = document.getElementById("UserCount");
        if (greetingSpan && verbSpan && userCountSpan) {
            greetingSpan.textContent = greeting;
            verbSpan.textContent = verb;
            userCountSpan.textContent = String(userCount);
        }
        const tmuxContainer = document.getElementById("TmuxConsoleContainer");
        if (tmuxContainer) {
            if (user?.role === "user") {
                tmuxContainer.style.display = "none";
            }
            else {
                tmuxContainer.style.display = "flex";
            }
        }
        // TMUX Konsole + Eingabe holen
        const tmuxOutput = document.getElementById("TmuxConsoleOutput");
        // Die Eingabe + Button gibt es nur, wenn Admin oder Manager ist
        const isPrivilegedUser = user?.role === "admin" || user?.role === "manager";
        let tmuxCommandInput = null;
        let tmuxCommandSend = null;
        if (isPrivilegedUser) {
            tmuxCommandInput = document.getElementById("TmuxCommandInput");
            tmuxCommandSend = document.getElementById("TmuxCommandSend");
            // Falls Eingabefeld/ Button im HTML fehlen, evtl. dynamisch erstellen
        }
        else {
            // Für normale User: Eingabefeld und Button ausblenden, falls vorhanden
            const inputEl = document.getElementById("TmuxCommandInput");
            if (inputEl)
                inputEl.style.display = "none";
            const sendBtnEl = document.getElementById("TmuxCommandSend");
            if (sendBtnEl)
                sendBtnEl.style.display = "none";
        }
        // Hilfsfunktion: tmux-Ausgabe laden und anzeigen
        const updateTmuxOutput = async () => {
            if (!tmuxOutput)
                return;
            // Prüfen, ob User am unteren Rand ist (innerhalb 20px Toleranz)
            const isScrolledToBottom = (tmuxOutput.scrollHeight - tmuxOutput.clientHeight - tmuxOutput.scrollTop) < 20;
            const output = await this.appManager.getTmuxOutput();
            tmuxOutput.textContent = output;
            if (isScrolledToBottom) {
                tmuxOutput.scrollTop = tmuxOutput.scrollHeight;
            }
        };
        // Lade initial tmux-Ausgabe
        await updateTmuxOutput();
        // Intervall nur einmal starten
        if (this.tmuxUpdateIntervalId === null) {
            this.tmuxUpdateIntervalId = window.setInterval(updateTmuxOutput, 3000);
        }
        if (!this.listenersSet) {
            // Button klick handler: Befehl senden und Ausgabe aktualisieren (nur für privilegierte Nutzer)
            tmuxCommandSend?.addEventListener("click", async () => {
                const command = tmuxCommandInput?.value.trim() ?? "";
                if (command.length === 0)
                    return;
                await this.appManager.sendTmuxCommand(command);
                if (tmuxCommandInput)
                    tmuxCommandInput.value = "";
                await updateTmuxOutput();
            });
            // Enter-Taste im Eingabefeld
            tmuxCommandInput?.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    tmuxCommandSend?.click();
                }
            });
            // Sonstige Navigation
            document.getElementById("LinkLogout").addEventListener("click", () => {
                this.appManager.logout();
                this.appManager.loadLandingPage();
            });
            document.getElementById("LinkImpressum").addEventListener("click", () => {
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
    // Optional: Diese Methode solltest du beim Verlassen der Seite aufrufen, z.B. aus ApplicationManager
    async unloadPage() {
        if (this.tmuxUpdateIntervalId !== null) {
            clearInterval(this.tmuxUpdateIntervalId);
            this.tmuxUpdateIntervalId = null;
        }
    }
}
//# sourceMappingURL=StartPagePOM.js.map