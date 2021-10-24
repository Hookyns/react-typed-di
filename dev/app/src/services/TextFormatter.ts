export interface ITextFormatter
{
    format(text: string): string;
}

export class SpaceColorFormatter implements ITextFormatter
{
    format(text: string)
    {
        return "> " + text;
    }
}