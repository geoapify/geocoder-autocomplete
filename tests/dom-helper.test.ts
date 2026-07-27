import '@testing-library/jest-dom';
import { DomHelper } from "../src/helpers/dom.helper";

describe('DomHelper address rendering', () => {
    it('renders a postprocessed value as text while preserving highlighting', () => {
        const value = 'Cafe <img src=x onerror="alert(1)">';
        const result = DomHelper.getStyledAddressSingleValue(value, 'Cafe');

        expect(result.querySelector('img')).toBeNull();
        expect(result.textContent).toBe(value);
        expect(result.querySelector('strong')?.textContent).toBe('Cafe');
    });

    it('renders formatted address values as text', () => {
        const formatted = '<img src=x onerror="alert(1)">, Safe City, Safe Country';
        const result = DomHelper.getStyledAddress({ formatted }, 'img');
        const container = document.createElement('div');
        container.appendChild(result);

        expect(container.querySelector('img')).toBeNull();
        expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
        expect(container.querySelector('strong')?.textContent).toBe('img');
    });

    it('renders non-verified address values as text', () => {
        const unsafeStreet = '<svg onload="alert(1)">Unsafe Street</svg>';
        const result = DomHelper.getStyledAddress({
            formatted: `${unsafeStreet}, Safe City, Safe Country`,
            street: unsafeStreet,
            nonVerifiedParts: ['street']
        }, 'Unsafe');
        const container = document.createElement('div');
        container.appendChild(result);

        expect(container.querySelector('svg')).toBeNull();
        expect(container.querySelector('.non-verified')?.textContent).toBe(unsafeStreet);
    });
});
