import React from "react"
import ReactDOM from "react-dom"
import { createStore } from "redux"
import { Provider } from "react-redux"
import app from "./reducers"
import App from "./components/App"

let store = createStore(app);

ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>
    , document.getElementById("app")
);