import { ApplicationManager } from "../ApplicationManager.js";
import { AbstractPOM } from "./AbstractPOM.js";

export class ImpressumPagePOM extends AbstractPOM {

      constructor(private appManager: ApplicationManager) {
         super();
      }

    async loadPage(): Promise<void> {
       
      await AbstractPOM.showPage("./html/impressum.html");


      document.getElementById("LinkRoot")!.addEventListener("click", () => {
            if (this.appManager.isLoggedIn()) {
                this.appManager.loadStartPage();
            }
            else {
                this.appManager.loadLandingPage();
            }
        });


        
    }
}
