import {describe, expect, test} from 'vitest'

import {type ItemArea, extractDimensions} from '@/easy-grid/layout-parser'

describe('extractDimensions', () => {
    test('calculates ItemAreas for grid cell items', () => {
        const itemAreas = extractDimensions([
            [['1fr'], ['2fr'], ['3fr']],
            [['1fr'], ['A', 'B'], ['B', 'C'], ['C, D']],
            [['1fr'], ['A', 'B'], ['B'], ['D']],
        ])
    })
});