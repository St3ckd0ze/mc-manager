export class AbstractPOM {
    clearPageContent() {
        const pageContent = document.getElementById("PageContent");
        if (pageContent) {
            pageContent.innerHTML = "";
        }
    }
    showToast(message, success) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.top = "75px";
        toast.style.right = "20px";
        toast.style.backgroundColor = success ? "green" : "red";
        ;
        toast.style.color = "white";
        toast.style.padding = "10px 20px";
        toast.style.borderRadius = "5px";
        toast.style.border = "1px solid black";
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    }
    getElementById(id) {
        return document.getElementById(id);
    }
}
//# sourceMappingURL=AbstractPOM.js.map