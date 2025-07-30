import { AbstractPOM } from "./AbstractPOM.js";
export class StartPagePOM extends AbstractPOM {
    appManager;
    listenersSet = false;
    tmuxUpdateIntervalId = null;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    async loadPage() {
        await AbstractPOM.showPage(`./html/start.html`);
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
        const tmuxOutput = document.getElementById("TmuxConsoleOutput");
        const isPrivilegedUser = user?.role === "admin" || user?.role === "manager";
        let tmuxCommandInput = null;
        let tmuxCommandSend = null;
        if (isPrivilegedUser) {
            tmuxCommandInput = document.getElementById("TmuxCommandInput");
            tmuxCommandSend = document.getElementById("TmuxCommandSend");
        }
        else {
            const inputEl = document.getElementById("TmuxCommandInput");
            if (inputEl)
                inputEl.style.display = "none";
            const sendBtnEl = document.getElementById("TmuxCommandSend");
            if (sendBtnEl)
                sendBtnEl.style.display = "none";
        }
        const updateTmuxOutput = async () => {
            if (!tmuxOutput)
                return;
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
                if (command.length === 0)
                    return;
                await this.appManager.sendTmuxCommand(command);
                if (tmuxCommandInput)
                    tmuxCommandInput.value = "";
                await updateTmuxOutput();
            });
            tmuxCommandInput?.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    tmuxCommandSend?.click();
                }
            });
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
    async unloadPage() {
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
//# sourceMappingURL=StartPagePOM.js.map