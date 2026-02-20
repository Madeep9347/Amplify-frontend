import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_2YYjIAvbg",
      userPoolClientId: "41tmel619tlbai8s2jcap01dv0",
      region: "us-east-1"
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://pvl7rz22xfdtfpze4mz36mli44.appsync-api.us-east-1.amazonaws.com/graphql",
      region: "us-east-1",
      defaultAuthMode: "userPool"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

