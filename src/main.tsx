import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Load Photo Engine styles at entry so Arrive and Journal are styled immediately.
// Photo custom properties remain scoped under .photo-journey.

import "./styles/room-photo-tour.css";
import { initLang } from "./lib/lang";
import { initUtm } from "./lib/utm";


// Language resolved BEFORE rendering and any network calls (?lang= > localStorage > en):
// frozen for this load, it drives t(), Intl formats, and the Mews language.

initLang();

// UTMs captured BEFORE the URL is rewritten (otherwise lost) → attached to n8n tracking.
initUtm();

// Note: no <StrictMode> — in dev it double-invokes effects (so each
// Mews call would appear 2x in the Dev Panel). Removed for a call log faithful
// to production behavior (one call = one line).

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
