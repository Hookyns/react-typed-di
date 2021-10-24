import { IServiceCollection } from "@netleaf/extensions-dependency-injection-abstract";
import { Configuration }      from "../../../index";
import {
    ConsoleLogger,
    ILogger
}                             from "./services/Logger";
import {
    ITextFormatter,
    SpaceColorFormatter
}                             from "./services/TextFormatter";

export const rootConfiguration = {
    configureServices(serviceCollection: IServiceCollection)
    {
        serviceCollection.addSingleton<ITextFormatter, SpaceColorFormatter>();
        serviceCollection.addTransient<ILogger, ConsoleLogger>();
    }
} as Configuration;