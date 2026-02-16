import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_4ggR3R3Bt",
      userPoolClientId: "94cfgmoa9ojjd2kg7p8i6s9hc",
      region: "ap-south-1"
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://qiy5sa4hqrg6hcxa2qkrh7z52i.appsync-api.ap-south-1.amazonaws.com/graphql",
      region: "ap-south-1",
      defaultAuthMode: "userPool"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

