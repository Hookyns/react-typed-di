import { IServiceProvider } from "@netleaf/extensions-dependency-injection-abstract";
import { ITextFormatter }   from "./TextFormatter";

export interface ILogger
{
    info(message: string): void;
}

export class ConsoleLogger implements ILogger
{
    private readonly console: Console;

    constructor(private formatter: ITextFormatter, serviceProvider: IServiceProvider)
    {
        this.console = serviceProvider.getService("console");
    }

    info(message: string)
    {
        this.console.info(this.formatter.format(message));
    }
}