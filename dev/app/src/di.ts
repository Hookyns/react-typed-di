import { IServiceCollection } from "@netleaf/extensions-dependency-injection-abstract";
import { Configuration }      from "react-typed-di";
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
        const keep = [
            SpaceColorFormatter,
            ConsoleLogger
        ];

        let headerId = 1;

        serviceCollection.addSingleton<ITextFormatter, SpaceColorFormatter>();
        serviceCollection.addTransient<ILogger, ConsoleLogger>();
        serviceCollection.addScoped("headerId", () => headerId++);
    }
} as Configuration;