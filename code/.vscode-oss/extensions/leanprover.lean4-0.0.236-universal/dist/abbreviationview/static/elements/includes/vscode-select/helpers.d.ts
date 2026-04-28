import { TemplateResult } from 'lit';
import { InternalOption, SearchMethod } from './types.js';
export type SearchResult = {
    match: boolean;
    ranges: [number, number][];
};
export declare const startsWithPerTermSearch: (subject: string, pattern: string) => SearchResult;
export declare const startsWithSearch: (subject: string, pattern: string) => SearchResult;
export declare const containsSearch: (subject: string, pattern: string) => SearchResult;
export declare const fuzzySearch: (subject: string, pattern: string) => SearchResult;
export declare const filterOptionsByPattern: (list: InternalOption[], pattern: string, method: SearchMethod) => InternalOption[];
export declare const highlightRanges: (text: string, ranges: [number, number][]) => TemplateResult | TemplateResult[];
//# sourceMappingURL=helpers.d.ts.map