import { describe, expect, test } from 'vitest'

import { default as validateRows } from '@/easy-grid/validators'
import type { RowBounds } from '@/easy-grid/validators'
import { calculateRowBounds, splitRow, validateColumnHeaders, validateRow } from '@/easy-grid/validators'

describe('splitRow', () => {
    test('splits on spaces', () => {
        expect(splitRow('1em 2% 3fr')).toEqual(
            ['1em', '2%', '3fr'])
    })

    test('ignores spaces inside "function calls"', () => {
        expect(splitRow('some-call(2em, 3%) 2% 3fr')).toEqual(
            ['some-call(2em, 3%)', '2%', '3fr'])
    })

    test('throws on invalid column split', () => {
        expect(() => {
            splitRow('')
        }).toThrow(/cannot be split/)
    })
})

describe('validateColumnHeaders', () => {
    test('validates simple column specifications', () => {
        validateColumnHeaders([
            '1px', '20em', '23fr', '2%', 'min-content', 'max-content',
            'auto'])
    })

    test('validates fit-content column specifications', () => {
        validateColumnHeaders(['1px', 'fit-content(2%)'])
    })

    test('validates minmax column specification', () => {
        validateColumnHeaders(['1px', 'minmax(2%, max-content)'])
    })

    test('throws on invalid fit-content', () => {
        expect(() => {
            validateColumnHeaders(['1px', 'fit-content(2fr)'])
        }).toThrow(/invalid fit-content/)
    })

    test('throws on invalid fit-content too many values', () => {
        expect(() => {
            validateColumnHeaders(['1px', 'fit-content(2fr, 1em)'])
        }).toThrow(/invalid grid/)
    })

    test('throws on invalid minmax', () => {
        expect(() => {
            validateColumnHeaders(['1px', 'minmax(2fr, 2)'])
        }).toThrow(/invalid minmax/)
    })

    test('throws on invalid minmax too many values', () => {
        expect(() => {
            validateColumnHeaders(['1px', 'minmax(2fr, 2, 3%)'])
        }).toThrow(/invalid grid/)
    })
})

describe('validateRow', () => {
    test('throws on empty row', () => {
        expect(() => {
            validateRow([], 0)
        }).toThrow(/is empty/)
    })

    test('throws on invalid size specification', () => {
        expect(() => {
            validateRow(['2'], 0)
        }).toThrow(/invalid grid/)
    })

    test('validates only a size specification', () => {
        const row = validateRow(['fit-content(40%)'], 0)
        expect(row).toEqual([['fit-content(40%)']])
    })

    test('validates row with items', () => {
        const row = validateRow(['fit-content(40%)', 'A,B', 'C,D'], 0)
        expect(row).toEqual([['fit-content(40%)'], ['A', 'B'], ['C', 'D']])
    })

    test('validates row with contiguous items in different orders', () => {
        validateRow(['fit-content(40%)', 'A,B', 'B,A'], 0)
    })

    test('validates empty cells', () => {
        const row = validateRow(['fit-content(40%)', '..', 'C,D'], 0)
        expect(row).toEqual([['fit-content(40%)'], [], ['C', 'D']])
    })

    test('throws on repeated items', () => {
        expect(() => {
            validateRow(['fit-content(40%)', 'A,A', 'C,D'], 0)
        }).toThrow(/A in row 0 and column 1 is repeated/)
    })

    test('throws on non-contiguous items', () => {
        expect(() => {
            validateRow(['1em', 'A', 'B', 'A'], 0)
        }).toThrow(/A in row 0 and column 3 is not contiguous/)
    })
})

describe('calculateRowBounds', () => {
    test('calculates bounds correctly', () => {
        const expected = new Map<string, RowBounds>()
        expected.set('1fr', {left: 0, right: 0})
        expected.set('A', {left: 1, right: 1})
        expected.set('B', {left: 1, right: 2})
        expected.set('C', {left: 2, right: 3})
        expected.set('D', {left: 3, right: 3})
        const bounds = calculateRowBounds(
            [['1fr'], ['A', 'B'], ['B', 'C'], ['C', 'D']])
        expect(bounds).toEqual(expected)
    })
})

describe('validateRows', () => {
    test('throws on empty rows', () => {
        expect(() =>  {
            validateRows([])
        }).toThrow(/Cannot validate empty rows/)
    })

    test('passes valid column specifications', () => {
        validateRows(['1px 20em 23fr 2% min-content max-content'])
    })

    test('passes valid row only specification', () => {
        validateRows(['1px', '20em', '2%', 'min-content', 'max-content'])
    })

    test('parses rows', () => {
        const rows = validateRows(['1fr 2fr', '1fr A,B C,D', '2fr E,F G,H'])
        expect(rows).toEqual([
            [['1fr'], ['2fr']],
            [['1fr'], ['A', 'B'], ['C', 'D']],
            [['2fr'], ['E', 'F'], ['G', 'H']]
        ])
    })

    test('allows a single-cell grid', () => {
        validateRows(['1fr', '1fr A,B'])
    })

    test('throws on too many entries in second row', () => {
        expect(() => {
            validateRows(['1fr', '1fr A,B A,B'])
        }).toThrow(/only a single column header is defined/)
    })

    test('throws on invalid number of row entries', () => {
        expect(() => {
            validateRows(['1fr 2fr', '1fr A,B C,D', '2fr E,F'])
        }).toThrow(/Row 2 has 2 values instead of 3/)
    })

    test('throws on invalid bounds', () => {
        expect(() => {
            validateRows(['1fr 2fr', '1fr A,B C,D', '2fr C,D C,D'])
        }).toThrow(/C has bounds of 2, 2 on row 1 and bounds of 1, 2 on row 2. Bounds must match to form a rectangle./)
    })
})