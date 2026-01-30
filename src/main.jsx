import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: "https://n3yil3f55zfzdd4jmmad6trm3y.appsync-api.ap-south-1.amazonaws.com/graphql",
      region: "ap-south-1",
      defaultAuthMode: "apiKey",
      apiKey: "da2-6vmuticfhnff5nmhsmvwhld2nm"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

