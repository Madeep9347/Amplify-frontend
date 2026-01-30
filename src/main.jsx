import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: "https://yxfxvoax2rbtpbsp5wpp7wraxm.appsync-api.ap-south-1.amazonaws.com/graphql",
      region: "ap-south-1",
      defaultAuthMode: "apiKey",
      apiKey: "da2-7vxacrllebfibnqaakcvkyj6ny"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

