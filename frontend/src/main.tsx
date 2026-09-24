import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { getParticipantId } from "./utils/participant";

// Remember the participant code from the link (?p=P01) as soon as the page opens
getParticipantId();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
