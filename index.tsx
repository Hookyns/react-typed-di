import {
    TypedServiceCollection,
    TypedServiceProvider
}                 from "@netleaf/extensions-dependency-injection-typed";
import * as React from "react";
import {
    getType,
    Type
}                 from "tst-reflect";
import {
    IServiceProvider,
    IServiceCollection,
    IServiceScope
}                 from "@netleaf/extensions-dependency-injection-abstract";

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
    private _serviceProvider?: IServiceProvider = undefined;

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

const instanceKey = Symbol.for("react-typed-di-configurator");
const glob = ((global || window) as any);
const configuratorInstance: DIConfigurator = glob[instanceKey] || (glob[instanceKey] = new DIConfigurator());

const ReactContext = React.createContext<IServiceScope>({ serviceProvider: undefined } as any);

type State = {
    scope: IServiceScope
};

export const DI = {
    configurator: configuratorInstance,

    /**
     * Creates new scope.
     * @return {React.Context<IServiceScope>}
     * @constructor
     */
    get Scope(): React.Component
    {
        return class extends React.Component<{}, State>
        {
            constructor(props: {}, context: any)
            {
                super(props, context);

                this.state = {
                    scope: configuratorInstance.serviceProvider.createScope() as IServiceScope
                };
            }

            render()
            {
                return <div>
                    <ReactContext.Provider value={this.state.scope}>
                        {this.props.children}
                    </ReactContext.Provider>
                </div>;
            }
        } as any;
    }
};


type ComponentConstructor<T = React.Component> = new (...args: any[]) => T;

/**
 * Resolve constructor arguments.
 * @param {Type} type
 * @param {IServiceProvider} provider
 * @return {Array<any>}
 */
function resolveArguments(type: Type, provider: IServiceProvider): Array<any>
{
    const constructors = type.getConstructors();

    if (!constructors?.length)
    {
        return [];
    }

    // Ctor with less parameters preferred
    const constructor = constructors.sort((a, b) => a.parameters.length > b.parameters.length ? 1 : 0)[0];

    // Resolve parameters
    return constructor.parameters.slice(2).map(param => {
        const service = provider.getServices(param.type)[Symbol.iterator]().next().value;

        if (service === undefined)
        {
            if (param.optional)
            {
                return undefined;
            }

            throw new Error(`Error while construction of type '${type.fullName}'. Unable to resolve constructor parameter '${param.name}'.`
                + `Type of parameter '${param.type.fullName}' cannot be resolved and parameter is not optional.`);
        }

        return service;
    });
}

/**
 * @reflectDecorator
 * @return {[A, undefined, undefined, undefined, undefined, undefined, undefined]}
 */
export function useServices<A>(): [A, undefined, undefined, undefined, undefined, undefined, undefined] 
export function useServices<A, B>(): [A, B, undefined, undefined, undefined, undefined, undefined] 
export function useServices<A, B, C>(): [A, B, C, undefined, undefined, undefined, undefined] 
export function useServices<A, B, C, D>(): [A, B, C, D, undefined, undefined, undefined] 
export function useServices<A, B, C, D, E>(): [A, B, C, D, E, undefined, undefined] 
export function useServices<A, B, C, D, E, F>(): [A, B, C, D, E, F, undefined] 
export function useServices<A, B = void, C = void, D = void, E = void, F = void, G = void>(): [A, B | undefined, C | undefined, D | undefined, E | undefined, F | undefined, G | undefined] 
{
    const provider = configuratorInstance.serviceProvider;
    
    return [
        provider.getService(getType<A>()!), 
        provider.getService(getType<B>()!), 
        provider.getService(getType<C>()!), 
        provider.getService(getType<D>()!), 
        provider.getService(getType<E>()!), 
        provider.getService(getType<F>()!), 
        provider.getService(getType<G>()!)
    ];
}

/**
 * Decorator for Components which should use registered dependencies.
 * @reflectDecorator
 */
export function inject<TComponentType>()
{
    const componentType = getType<TComponentType>();

    if (!componentType)
    {
        throw new Error("Unknown component type. You maybe miss tst-reflect-transformer.");
    }

    return function <TType extends ComponentConstructor>(ComponentConstructor: TType): any {
        return class extends ComponentConstructor
        {
            static contextType = ReactContext;

            constructor(...args: any[])
            {
                const props = args[0];
                const context: IServiceScope = args[1];

                // if (!context)
                // {
                //     throw new Error("Component decorated by @inject is used out of the dependency context.");
                // }

                super(props, context, ...resolveArguments(componentType!, context?.serviceProvider || configuratorInstance.serviceProvider));
            }
        };
    };
}