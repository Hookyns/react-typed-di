import { IServiceProvider } from "@netleaf/extensions-dependency-injection-abstract";
import {
    Component,
    createContext
}                           from "react";
import {
    DI,
    inject,
    useServices
}                           from "react-typed-di";
import { ILogger }          from "./services/Logger";

import { ITextFormatter } from "./services/TextFormatter";

@inject()
class Header extends Component
{
    constructor(props: {}, context: any, private formatter: ITextFormatter, private serviceProvider: IServiceProvider)
    {
        super(props, context);

        console.log(useServices<ITextFormatter, ILogger>());
    }

    render()
    {
        return <>
            <h1>Hello World!</h1>
            <h1>{this.formatter.format("Hello World!")}</h1>
        </>;
    }
}

@inject()
class Com1 extends Component
{
    render()
    {
        return <div>
            <span>Com1</span>
            {this.props.children}
        </div>;
    }
}

@inject()
class Com2 extends Component
{
    render()
    {
        return <div>
            <span>Com2</span>
            {this.props.children}
        </div>;
    }
}

@inject()
class Com3 extends Component
{
    render()
    {
        return <div>
            <span>Com3</span>
            {this.props.children}
        </div>;
    }
}

@inject()
class Com4 extends Component
{
    render()
    {
        return <div>
            <Com6>
                Com6 content
            </Com6>

            <span>Com4</span>
            {this.props.children}
        </div>;
    }
}

@inject()
class Com5 extends Component
{
    render()
    {
        return <div>
            <span>Com5</span>
            {this.props.children}
        </div>;
    }
}


const context = createContext({ obj: false });

@inject()
class Com6 extends Component
{
    static contextType = context;

    render()
    {
        console.log("Context:", this.context);

        return <div>
            <span>Com6</span>
            {this.props.children}
        </div>;
    }
}


export class App extends Component
{
    render()
    {
        return <>
            <h1>Hello World!</h1>

            <Header/>

            <context.Provider value={{ obj: true }}>
                {/*<DI.Scope>*/}
                    <Header/>

                    <Com1>
                        <Com2>
                            com2 content
                        </Com2>
                    </Com1>
                {/*</DI.Scope>*/}

                <Com3>
                    <Com4>
                        <Com5>content of com5</Com5>
                    </Com4>
                </Com3>
            </context.Provider>
        </>;
    }
}