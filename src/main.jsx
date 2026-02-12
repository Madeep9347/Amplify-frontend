import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";


Amplify.configure({
  API: {
    GraphQL: {
      endpoint: 'https://qiy5sa4hqrg6hcxa2qkrh7z52i.appsync-api.ap-south-1.amazonaws.com/graphql',
      region: 'ap-south-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'da2-x6kl4ud6xvft5d2audwqnovrne'
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

