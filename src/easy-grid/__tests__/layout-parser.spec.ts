import { describe, expect, test } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'

import type { CellCoordinates, ItemArea } from '@/easy-grid/layout-parser'
import { default as easyGrid, extractEmptyCells, extractItemAreas, interpolate } from '@/easy-grid/layout-parser'

describe('extractDimensions', () => {
    test('no item areas for column only specs', () => {
        const itemAreas = extractItemAreas([
            [['1fr'], ['2fr'], ['3fr']],
        ])
        expect(itemAreas).toHaveLength(0)
    })

    test('no item areas for row only specs', () => {
        const itemAreas = extractItemAreas([
            [['1fr']],
            [['1fr']],
            [['1fr']],
        ])
        expect(itemAreas).toHaveLength(0)
    })
    
    test('calculates ItemAreas for grid cell items', () => {
        const itemAreas = extractItemAreas([
            [['1fr'], ['2fr'], ['3fr']],
            [['1fr'], ['A', 'B'], ['B', 'C'], ['C', 'D']],
            [['1fr'], ['A', 'B'], ['B'], ['D']],
        ])
        const expected = new Map<string, ItemArea>();
        expected.set('A', {top: 0, left: 0, bottom: 1, right: 0})
        expected.set('B', {top: 0, left: 0, bottom: 1, right: 1})
        expected.set('C', {top: 0, left: 1, bottom: 0, right: 2})
        expected.set('D', {top: 0, left: 2, bottom: 1, right: 2})
        expect(itemAreas).toEqual(expected)
    })

    test('calcuates ItemAreas for single cell grid', () => {
        const itemAreas = extractItemAreas([
            [['1fr']],
            [['1fr'], ['A', 'B']],
        ])
        const expected = new Map<string, ItemArea>();
        expected.set('A', {top: 0, left: 0, bottom: 0, right: 0})
        expected.set('B', {top: 0, left: 0, bottom: 0, right: 0})
        expect(itemAreas).toEqual(expected)
    })
})

describe('extractEmptyCells', () => {
    test('no cell coordinates for column only specs', () => {
        const cellCoordinates = extractEmptyCells([
            [['1fr'], ['2fr'], ['3fr']],
        ])
        expect(cellCoordinates).toHaveLength(0)
    })

    test('no cell coordinates for row only specs', () => {
        const cellCoordinates = extractEmptyCells([
            [['1fr']],
            [['1fr']],
            [['1fr']],
        ])
        expect(cellCoordinates).toHaveLength(0)
    })

    test('extracts CellCoordinates for empty cells', () => {
        const cellCoordinates = extractEmptyCells([
            [['1fr'], ['2fr'], ['3fr']],
            [['1fr'], ['A', 'B'], [], ['C', 'D']],
            [['1fr'], ['A', 'B'], [], ['D']],
        ])
        const expected: Array<CellCoordinates> = [
            {row: 0, column: 1},
            {row: 1, column: 1},
        ]
        expect(cellCoordinates).toEqual(expected)
    })
})

describe('interpolate', () => {
    test('returns an interpolated tagged template', () => {
        const one = 'Hello'
        const two = 3
        const three = 3.14
        const four = [1, 2]
        const returned = interpolate`-${one}-${two}-${three}-${four}`;
        const expected = '-Hello-3-3.14-1,2'
        expect(returned).toBe(expected)
    })
})

describe('easyGrid', () => {
    test('throws when not enough children for column only spec', () => {
        const gridComponent = easyGrid`
            1fr  1fr  1fr
        `;
        const funcComponent = () => {
            return h(gridComponent, () => ['div', 'div'])
        }
        expect(() => {
            mount(funcComponent)
        }).toThrow(/Column-only easy grid requires/)
    })

    test('passes single grid spec', () => {
        const gridComponent = easyGrid`
            1fr
        1fr A,B
        `;
        const funcComponent = () => {
            return h(gridComponent, null, {
                A: () => h('div'),
                B: () => h('div'),
            })
        }
        mount(funcComponent)
    })

    test('throws when not enough children for row only spec', () => {
        const gridComponent = easyGrid`
            1fr
            1fr
            1fr
        `;
        const funcComponent = () => {
            return h(gridComponent, () => ['div', 'div'])
        }
        expect(() => {
            mount(funcComponent)
        }).toThrow(/Row-only easy grid requires/)
    })

    test('throws when missing named slots for grid spec', () => {
        const gridComponent = easyGrid`
            1fr  1fr
        1fr  A    B
        1fr  A    B
        `;
        const funcComponent = () => {
            return h(gridComponent, null, {
                A: () => h('div')
            })
        }
        expect(() => {
            mount(funcComponent)
        }).toThrow(/No child slot named B found./)
    })

    test('renders a column-only grid', () =>  {
        const gridComponent = easyGrid`
            1fr  1fr  1fr
        `;
        const funcComponent = () => {
            const one = h('div', {name: 'childTwo'})
            const two = h('div', {name: 'childOne'})
            const three = h('div', {name: 'childThree'})
            return h(gridComponent, () => [one, two, three])
        }
        const wrapper = mount(funcComponent)
        expect(wrapper.find(
            '[easyGrid=columnOnlyContainer]').exists()).toBeTruthy()
        const innerHtml = wrapper.html()
        const childOneIndex = innerHtml.indexOf('childTwo')
        const childTwoIndex = innerHtml.indexOf('childOne')
        const childThreeIndex = innerHtml.indexOf('childThree')
        expect(childOneIndex).toBeLessThan(childTwoIndex)
        expect(childTwoIndex).toBeLessThan(childThreeIndex)
    })
    
    test('renders a row-only grid', () =>  {
        const gridComponent = easyGrid`
            1fr
            1fr
            1fr
        `;
        const funcComponent = () => {
            const one = h('div', {name: 'childOne'})
            const two = h('div', {name: 'childTwo'})
            const three = h('div', {name: 'childThree'})
            return h(gridComponent, [one, two, three])
        }
        const wrapper = mount(funcComponent)
        expect(wrapper.find(
            '[easyGrid=rowOnlyContainer]').exists()).toBeTruthy()
        const innerHtml = wrapper.html()
        const childOneIndex = innerHtml.indexOf('childOne')
        const childTwoIndex = innerHtml.indexOf('childTwo')
        const childThreeIndex = innerHtml.indexOf('childThree')
        expect(childOneIndex > 0 && childTwoIndex > 0
            && childThreeIndex > 0).toBeTruthy()
        expect(childOneIndex).toBeLessThan(childTwoIndex)
        expect(childTwoIndex).toBeLessThan(childThreeIndex)
    })

    test('orders children alphabetically', () =>  {
        // Even though B comes before A in the grid, A should be rendered first
        // in the child ordering because it comes before B alphabetically.
        const gridComponent = easyGrid`
            1fr  1fr
        1fr  B    A
        1fr  B    A
        `;
        const funcComponent = () => {
            return h(gridComponent, null, {
                // B is before A in the named slots of the gridComponent, but
                // they should be reversed when rendered since A comes before B
                // alphabetically.
                B: () => h('div'),
                A: () => h('div'),
            })
        }
        const wrapper = mount(funcComponent)
        expect(wrapper.find(
            '[easyGrid=container]').exists()).toBeTruthy()
        const innerHtml = wrapper.html()
        const childAIndex = innerHtml.indexOf('cell-A')
        const childBIndex = innerHtml.indexOf('cell-B')
        expect(childAIndex > 0 && childBIndex > 0).toBeTruthy()
        expect(childAIndex).toBeLessThan(childBIndex)
    })

    test('renders empty cells', () => {
        const gridComponent = easyGrid`
            1fr  1fr
        1fr  ..   A
        1fr  B    ..
        `;
        const funcComponent = () => {
            return h(gridComponent, null, {
                B: () => h('div'),
                A: () => h('div'),
            })
        }
        const wrapper = mount(funcComponent)
        expect(wrapper.find(
            '[easyGrid=container]').exists()).toBeTruthy()
        const innerHtml = wrapper.html()
        const childAIndex = innerHtml.indexOf('cell-A')
        const childBIndex = innerHtml.indexOf('cell-B')
        expect(childAIndex > 0 && childBIndex > 0).toBeTruthy()
        expect(childAIndex).toBeLessThan(childBIndex)
        expect(innerHtml.match(/emptyCell/g) || []).toHaveLength(2)
    })
})