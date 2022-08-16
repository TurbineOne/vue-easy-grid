import { css, type CSSObject } from '@emotion/css'
import { defineComponent, h } from 'vue'
import type { DefineComponent, VNode } from 'vue'
import { default as validateRows, EMPTY_CELL } from '@/easy-grid/validators'

interface ItemArea {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

interface CellCoordinates {
    row: number,
    column: number,
}

type ParsedLayout = string[][][]

const extractEmptyCells = (parsedLayout: ParsedLayout): CellCoordinates[] => {
    // Remove the column and row headers if this is not a column or row only
    // specification.
    let layout = parsedLayout;
    const emptyCells = new Array<CellCoordinates>()
    if (parsedLayout.length > 1 && parsedLayout[0].length > 1) {
        layout = parsedLayout.slice(1).map(row => row.slice(1));
    } else if (parsedLayout.length == 1 || parsedLayout[0].length == 1) {
        return emptyCells;
    }
    
    layout.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            if (column.length === 0) {
                emptyCells.push({row: rowIndex, column: columnIndex})
            }
        })
    })
    return emptyCells
}

const extractItemAreas = (
    parsedLayout: ParsedLayout): Map<string, ItemArea> => {
    const itemAreas = new Map<string, ItemArea>()
    // Remove the column and row headers if this is not a column or row only
    // specification.
    let layout = parsedLayout;
    if (parsedLayout.length > 1 && parsedLayout[0].length > 1) {
        layout = parsedLayout.slice(1).map(row => row.slice(1));
    } else if (parsedLayout.length == 1 || parsedLayout[0].length == 1) {
        return itemAreas;
    }
    
    layout.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            for (const item of column) {
                if (!itemAreas.has(item)) {
                    itemAreas.set(item, {
                        top: rowIndex,
                        left: columnIndex,
                        bottom: rowIndex,
                        right: columnIndex,
                    })
                } else {
                    const currentArea = itemAreas.get(item)!
                    itemAreas.set(item, {
                        ...currentArea,
                        bottom: rowIndex,
                        right: columnIndex,
                    })
                }
            }
        })
    })
    return itemAreas
}

const interpolate = (
    layoutStrings: TemplateStringsArray, ...values: Object[]): string => {
    const stringFragments = []
    for (const stringPart of layoutStrings) {
        stringFragments.push(stringPart)
        stringFragments.push(values.shift())
    }
    return stringFragments.join('')
}

enum LayoutType {
    Grid = 1,
    ColumnOnly,
    RowOnly,
}

// Defines a tagged template method for parsing a grid layout string. It returns
// a Vue composition component that can be used in templates.
export default (
    layoutStrings: TemplateStringsArray, ...values: any[]): DefineComponent => {
    const rows = interpolate(layoutStrings, ...values).split(/\n/)
        .map(val => val.trim()).filter(val => val.length > 0)
    const parsedLayout = validateRows(rows)
    const gridDivCssObjects: CSSObject[] = [{display: "grid"}]
    const gridTemplateColumns = parsedLayout[0].map(val => val[0])
    const gridTemplateRows = parsedLayout.map(val => val[0]).map(val => val[0])
    // If there is a column or row only layour, named children are not required.
    let layoutType = LayoutType.Grid
    if (parsedLayout.length == 1) {
        layoutType = LayoutType.ColumnOnly
        gridDivCssObjects.push({
            gridTemplateColumns: gridTemplateColumns.join(' ')
        })
    } else if (parsedLayout[0].length == 1) {
        layoutType = LayoutType.RowOnly
        gridDivCssObjects.push({
            gridTemplateRows: gridTemplateRows.join(' ')
        })
    } else {
        // If the grid is not column or row only, then remove the first entry
        // from the gridTemplateRows, which corresponds to the first entry of
        // the column headers row.
        gridDivCssObjects.push({
            gridTemplateColumns: gridTemplateColumns.join(' '),
            gridTemplateRows: gridTemplateRows.slice(1).join(' ')
        })
    }
    const gridCellCssObjects = new Map<string, CSSObject>()
    extractItemAreas(parsedLayout).forEach((value: ItemArea, key: string) => {
        gridCellCssObjects.set(key, {
            gridRowStart: value.top + 1,
            gridRowEnd: value.bottom + 2,
            gridColumnStart: value.left + 1,
            gridColumnEnd: value.right + 2,
            position: 'relative',
        })
    })
    const emptyCellCssObjects = new Array<CSSObject>()
    extractEmptyCells(parsedLayout).forEach((value: CellCoordinates) => {
        emptyCellCssObjects.push({
            gridRowStart: value.row + 1,
            gridRowEnd: value.row + 2,
            gridColumnStart: value.column + 1,
            gridColumnEnd: value.column + 2,
        })
    })
    return defineComponent({
        props: {
            gridColumnGap: {type: Number, required: false},
            gridRowGap: {type: Number, required: false},
        },
        setup: (props, context) => {
            if (props.gridColumnGap) {
                gridDivCssObjects.push({ columnGap: props.gridColumnGap })
            }
            if (props.gridRowGap) {
                gridDivCssObjects.push({ rowGap: props.gridRowGap })
            }
            const render = (): VNode => {
                if (layoutType == LayoutType.ColumnOnly) {
                    const children = context.slots.default ? 
                        context.slots.default() : []
                    if (gridTemplateColumns.length !== children.length) {
                        throw (
                            `Column-only easy grid requires ` +
                            `${gridTemplateColumns.length} default child ` +
                            `slots, but ${children.length} were found.`
                        )
                    }
                    return h(
                        'div', {
                            easyGrid: 'columnOnlyContainer',
                            class: css(gridDivCssObjects)
                        }, children)
                }
                if (layoutType == LayoutType.RowOnly) {
                    const children = context.slots.default ? 
                        context.slots.default() : []
                    if (gridTemplateRows.length !== children.length) {
                        throw (
                            `Row-only easy grid requires ` +
                            `${gridTemplateRows.length} default child ` +
                            `slots, but ${children.length} were found.`
                        )
                    }
                    return h(
                        'div', {
                            easyGrid: 'rowOnlyContainer',
                            class: css(gridDivCssObjects)
                        }, children)
                }
                const children: VNode[] = [];
                // Sort the children by item name to make rendering order
                // deterministic.
                Array.from(
                    gridCellCssObjects.keys()).sort().forEach((key: string) => {
                    if (!context.slots[key]) {
                        throw `No child slot named ${key} found.`
                    }
                    const child = h(context.slots[key]!)
                    children.push(h('div', {
                        easyGrid: `cell-${key}`,
                        class: css(gridCellCssObjects.get(key))
                    }, [child]))
                })
                emptyCellCssObjects.forEach((value: CSSObject) => {
                    children.push(h('div', {
                        easyGrid: 'emptyCell',
                        class: css(value)
                    }))
                })

                return h('div', {
                    easyGrid: 'container',
                    class: css(gridDivCssObjects)
                }, children)
            }
            return render
        }
    })
}
export {type CellCoordinates, type ItemArea, extractEmptyCells, extractItemAreas, interpolate}