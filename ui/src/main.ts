import { AppRoot } from "./components/app-root.js";
import { ConfigList } from "./components/config-list.js";
import { ConfigDetail } from "./components/config-detail.js";
import { ConfigForm } from "./components/config-form.js";
import { ConfirmDialog } from "./components/confirm-dialog.js";
import { ToastNotification } from "./components/toast-notification.js";

customElements.define("app-root", AppRoot);
customElements.define("config-list", ConfigList);
customElements.define("config-detail", ConfigDetail);
customElements.define("config-form", ConfigForm);
customElements.define("confirm-dialog", ConfirmDialog);
customElements.define("toast-notification", ToastNotification);
