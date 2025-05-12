export abstract class AbstractPOM {

    clearPageContent() {
        const pageContent = document.getElementById("PageContent");
        if (pageContent) {
            pageContent.innerHTML = "";
        }
    }

    protected showToast(message: string) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.backgroundColor = "#333";
        toast.style.color = "white";
        toast.style.padding = "10px 20px";
        toast.style.borderRadius = "5px";
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    }

    getElementById(id: string): HTMLElement | null {
        return document.getElementById(id);
    }

    abstract showPage(): void;
}