import { AbstractPOM } from "./AbstractPOM.js";
export class ImpressumPagePOM extends AbstractPOM {
    appManager;
    constructor(appManager) {
        super();
        this.appManager = appManager;
    }
    showPage() {
        this.clearPageContent();
        const pageContent = document.getElementById("PageContent");
        const container = document.createElement("div");
        container.id = "ImpressumPage";
        container.innerHTML = `
  <div class="container mt-5">
    <h1>Impressum</h1>
    <p><strong>Angaben gemäß § 5 TMG:</strong></p>
    <p><strong>Max Mustermann GmbH</strong><br>
       Musterstraße 1<br>
       12345 Musterstadt<br>
       Deutschland
    </p>
    <p><strong>Vertreten durch:</strong><br>
       Max Mustermann (Geschäftsführer)
    </p>
    <p><strong>Kontakt:</strong><br>
       Telefon: 0123456789<br>
       E-Mail: <a href="mailto:max@example.com">max@example.com</a><br>
       Website: <a href="https://www.example.com" target="_blank">www.example.com</a>
    </p>
    <p><strong>Handelsregister:</strong><br>
       Amtsgericht Musterstadt, HRB 12345
    </p>
    <p><strong>Umsatzsteuer-ID:</strong><br>
       DE123456789
    </p>
    <p><strong>Verantwortlich für den Inhalt nach 18 Absatz 2 MStV:</strong><br>
       Max Mustermann<br>
       Musterstraße 1, 12345 Musterstadt
    </p>
  </div>
        `;
        pageContent?.appendChild(container);
    }
}
//# sourceMappingURL=ImpressumPagePOM.js.map