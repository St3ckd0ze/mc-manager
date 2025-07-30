export abstract class AbstractPOM {
    abstract loadPage(): Promise<void>;
    abstract unloadPage(): Promise<void>;

    clearPageContent() {
        const pageContent = document.getElementById("PageContent");
        if (pageContent) {
            pageContent.innerHTML = "";
        }
    }

    protected showToast(message: string, success: boolean) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.top = "75px";
        toast.style.right = "20px";
        toast.style.backgroundColor = success ? "green" : "red";;
        toast.style.color = "white";
        toast.style.padding = "10px 20px";
        toast.style.borderRadius = "5px";
        toast.style.border = "1px solid black";
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    }

    getElementById(id: string): HTMLElement | null {
        return document.getElementById(id);
    }

    public static async showPage(path: string): Promise<void> {

        const appContent = document.getElementById('pageContent');

        try {
            const response = await fetch(path, );
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const htmlContent = await response.text();

            if(appContent){
                appContent.innerHTML = '';
                appContent.innerHTML = htmlContent;
            } else {
                console.error(`Container with id "pageContent" not found.`);
            }
        } catch (error) {
            console.error("Failed to showPage with path: " + path);
        }
    }

}
