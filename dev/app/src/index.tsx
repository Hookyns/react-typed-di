import React                 from "react";
import { render }            from "react-dom";
import { DI }                from "../../../index";
import { App }               from "./App";
import { rootConfiguration } from "./di";

DI.configurator
    .add(rootConfiguration)
    .build();

render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.querySelector("#root")
);