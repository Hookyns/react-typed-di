import {
    TypedServiceCollection,
    TypedServiceProvider
}                  from "@netleaf/extensions-dependency-injection-typed";
import * as React  from "react";
import { getType } from "tst-reflect";
import {
    IServiceProvider,
    IServiceCollection,
    IServiceScope
}                  from "@netleaf/extensions-dependency-injection-abstract";

type ComponentConstructor<T = {}> = new (...args: any[]) => T;

/**
 * Decorator for Components which should use registered dependencies.
 * @reflectDecorator
 */
export function inject<TComponentType>()
{
    const componentType = getType<TComponentType>();

    return function <TType extends ComponentConstructor>(ComponentConstructor: TType) {
        return class extends ComponentConstructor
        {
            constructor(...args: any[])
            {
                const props = args[0];
                const context = args[1];

                if (!context)
                {
                    throw new Error("Component decorated by @inject is used out of the dependency context.");
                }

                // console.log("INJECTABLE", args[0]);
                super(props, context, ...["resolved", "services"]);
            }
        };
    };
}

export interface Configuration
{
    /**
     * Method called when creating ServiceCollection. You can register your services here.
     * @param {IServiceCollection} serviceCollection
     */
    configureServices?(serviceCollection: IServiceCollection): void;

    /**
     * Method called when root ServiceProvider created. You can do some initial configuration.
     * @param {IServiceProvider} serviceProvider
     */
    configure?(serviceProvider: IServiceProvider): void;
}

class DIConfigurator
{
    /**
     * List of added configurations.
     * @type {Array<Configuration>}
     * @private
     */
    private readonly _configurations: Array<Configuration> = [];

    /**
     * Instance of built ServiceProvider.
     * @type {TypedServiceProvider}
     * @private
     */
    private _serviceProvider?: IServiceProvider;

    /**
     * Returns instance of built ServiceProvider.
     * @return {IServiceProvider}
     */
    get serviceProvider(): IServiceProvider
    {
        if (!this._serviceProvider)
        {
            throw new Error("Configurator has not been built yet.");
        }

        return this._serviceProvider;
    }

    /**
     * Add configuration object.
     * @param {Configuration} configuration
     * @return {DIConfigurator}
     */
    add(configuration: Configuration): DIConfigurator
    {
        this._configurations.push(configuration);
        return this;
    }

    /**
     * Build the configuration.
     */
    build(): DIConfigurator
    {
        const serviceCollection = new TypedServiceCollection();

        for (let configuration of this._configurations)
        {
            configuration.configureServices?.(serviceCollection);
        }

        const serviceProvider = new TypedServiceProvider(serviceCollection);

        for (let configuration of this._configurations)
        {
            configuration.configure?.(serviceProvider);
        }

        this._serviceProvider = serviceProvider;

        return this;
    }
}

const configurator = new DIConfigurator();

export const DI = {
    configurator,

    /**
     * Creates new scope.
     * @return {React.Context<IServiceScope>}
     * @constructor
     */
    get Scope(): React.FunctionComponent
    {
        const context = React.createContext<IServiceScope | undefined>(undefined);
        return () => <context.Provider value={configurator.serviceProvider.createScope()}/>;
        // return createElement(context.Provider, { value: configurator.serviceProvider.createScope() }, null);
    }
};