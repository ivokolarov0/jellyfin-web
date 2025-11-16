import React, {
    useCallback,
    useState,
    useMemo,
    useDeferredValue
} from 'react';
import Input from 'elements/emby-input/Input';
import globalize from 'lib/globalize';
import { type BaseItemDto } from '@jellyfin/sdk/lib/generated-client';

interface SearchFieldProps<T extends string | number | BaseItemDto> {
    items: T[]
    minItemsForSearch?: number,
    customFilter?: (item: T, query: string) => boolean,
    children: (values: T[]) => React.ReactNode
}

const SearchField = <T extends string | number | BaseItemDto>({ children, items, minItemsForSearch = 15, customFilter }: SearchFieldProps<T>) => {
    const [query, setQuery] = useState('');

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }, []);

    const deferredQuery = useDeferredValue(query);

    const filteredValues: T[] = useMemo(() => {
        const q = deferredQuery.trim().toLowerCase();
        if (!q) return items;
        return items.filter(item => customFilter ? customFilter(item, q) : item.toString().toLowerCase().includes(q));
    }, [items, deferredQuery, customFilter]);

    // Memoize children rendering so it doesn't re-render on every keystroke
    const renderedChildren = useMemo(() => children(filteredValues), [children, filteredValues]);

    return (
        <div>
            {items.length >= minItemsForSearch && (
                <Input
                    id='filterSearchInput'
                    type='search'
                    placeholder={globalize.translate('Search')}
                    value={query}
                    onInput={handleSearch}
                />
            )}
            {renderedChildren}
        </div>
    );
};

export default SearchField;
