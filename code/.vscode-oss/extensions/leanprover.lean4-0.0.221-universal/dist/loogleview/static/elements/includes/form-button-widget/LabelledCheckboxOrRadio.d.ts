import { LitElement, TemplateResult } from 'lit';
type Constructor<T = {}> = new (...args: any[]) => T;
export declare class LabelledCheckboxOrRadioInterface {
    label: string;
    protected _handleSlotChange(): void;
    protected _renderLabelAttribute(): TemplateResult;
}
export declare const LabelledCheckboxOrRadioMixin: <T extends Constructor<LitElement>>(superClass: T) => Constructor<LabelledCheckboxOrRadioInterface> & T;
export {};
//# sourceMappingURL=LabelledCheckboxOrRadio.d.ts.map