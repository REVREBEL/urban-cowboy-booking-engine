import ReactDOM from "react-dom/client";

import ComponentLibrary from "./ComponentLibrary";
import { BookingProvider } from "@/state/booking";
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BookingProvider>
    <ComponentLibrary />
  </BookingProvider>
);
