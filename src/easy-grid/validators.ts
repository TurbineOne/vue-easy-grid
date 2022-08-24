const PIXEL_SIZE = /^\d+px$/
const FLEX_SIZE = /^\d+fr$/
const EM_SIZE = /^\d+em$/
const VH_SIZE = /^\d+vh$/
const VW_SIZE = /^\d+vw$/
const PERCENT_SIZE = /^\d+%$/
const AUTO = /^auto$/
const MIN_CONTENT = /^min-content$/
const MAX_CONTENT = /^max-content$/
const FIT_CONTENT = /^fit-content\((\S+)\)$/
const MIN_MAX = /^minmax\((\S+),\s+(\S+)\)$/
const EMPTY_CELL = /^..$/

// Split column headers row, ignoring spaces inside parenthesis.
const splitRow = (columnHeaderRowString: string): string[] => {
    // A regex matching words with paranthesis containing comma and space
    // separated values or one or more non-space values followed by zero or more
    // spaces.
    const columnHeaders = /\S+\((?:(?:\S+,\s+)|(?:\S+))+\)|(?:\S+)/g
    const columnHeaderMatch = columnHeaderRowString.match(columnHeaders)
    if (!columnHeaderMatch) {
        throw `${columnHeaderRowString} cannot be split correctly`
    }
    return columnHeaderMatch
}

const validateSizeSpecification = (val: string): string => {
    const matchesLength = (val: string): boolean => {
        return !!val.match(PIXEL_SIZE) || !!val.match(EM_SIZE)
    }

    const matchesLengthOrPercentage = (val: string): boolean => {
        return matchesLength(val) || !!val.match(PERCENT_SIZE)
    }

    const matchesSimpleValues = (val: string): boolean => {
        return (
            !!val.match(PIXEL_SIZE) || !!val.match(FLEX_SIZE) ||
            !!val.match(EM_SIZE) || !!val.match(PERCENT_SIZE) ||
            !!val.match(MIN_CONTENT) || !!val.match(MAX_CONTENT) ||
            !!val.match(VH_SIZE) || !!val.match(VW_SIZE) || !!val.match(AUTO)
        )
    }

    const minMaxMatch = val.match(MIN_MAX)
    if (minMaxMatch && minMaxMatch.length === 3) {
        const matchFirst = matchesSimpleValues(minMaxMatch[1])
        const matchSecond = matchesSimpleValues(minMaxMatch[2])
        if (matchFirst && matchSecond) {
            return val        
        } else {
            throw `${val} is an invalid minmax specification`
        }
    }
    const fitContentMatch = val.match(FIT_CONTENT)
    if (fitContentMatch && fitContentMatch.length === 2) {
        if (matchesLengthOrPercentage(fitContentMatch[1])) {
            return val
        } else {
            throw `${val} is an invalid fit-content specification`
        }
    }
    if (matchesSimpleValues(val)) {
        return val
    } else {
        throw `${val} is an invalid grid specification`
    }
}

// Given the column headers row, return whether each header represents a valid
// grid column specification.
const validateColumnHeaders = (columnHeaders: string[]): string[][] => {
    return columnHeaders.map(
        (val: string): string[] => [validateSizeSpecification(val)])
}

// Item entries involve some set of comma separated identifiers. Since these end
// up as strings, there really isn't any limit on characters. However, the same
// entry cannot contain the same item identifier more than once.
const validateItemEntry = (gridCell: string, idx: number): string[] => {
    const items = gridCell.split(',').map(val => val.trim())
    if (items.length === 1 && items[0].match(EMPTY_CELL)) {
        return []
    }
    const seenItems = new Set<string>()
    const orderedItems = new Array<string>()
    items.forEach((value, colIndex) => {
        if (seenItems.has(value)) {
            throw `${value} in row ${idx} and column ${colIndex} is repeated`
        }
        seenItems.add(value)
        orderedItems.push(value)
    })
    return orderedItems
}

// Validate that standard rows have at least the row specification followed by
// zero or more cell specifications.
const validateRow = (standardRow: string[], idx: number): string[][] => {
    const rowValues: string[][] = []
    if (standardRow.length == 0) {
        throw `Row number ${idx} is empty`
    }
    if (standardRow.length >= 1) {
        rowValues.push([validateSizeSpecification(standardRow[0])])
    }
    const seenItems = new Set<string>()
    let lastItems = new Set<string>()
    let currentItems = new Set<string>()
    if (standardRow.length >= 2) {
        for (let i = 1; i < standardRow.length; ++i) {
            const items = validateItemEntry(standardRow[i], idx)
            for (const item of items) {
                if (seenItems.has(item) && !lastItems.has(item)) {
                    throw (
                        `${item} in row ${idx} and column ${i} ` +
                        `is not contiguous`
                    )
                }
                seenItems.add(item)
                currentItems.add(item)
            }
            lastItems.clear()
            currentItems.forEach(item => lastItems.add(item))
            currentItems.clear()
            rowValues.push(items)
        }
    }
    return rowValues
}

// Keeps track of the left-most and right-most bounds for a given grid item.
// These must match per row, or else the item is not forming a rectangle.
interface RowBounds {
    left: number;
    right: number;
}

const rowBoundsEqual = (first: RowBounds, second: RowBounds): boolean => {
    return first.left === second.left && first.right == second.right
}

// Calculates the spanning dimensions of contiguous grid items per row.
const calculateRowBounds = (rowItems: string[][]): Map<string, RowBounds> => {
    const itemBounds = new Map<string, RowBounds>();
    rowItems.forEach((cell, cellIndex) => {
        for (const item of cell) {
            if (itemBounds.has(item)) {
                const existingBounds = itemBounds.get(item)!
                itemBounds.set(item, {
                    ...existingBounds,
                    right: cellIndex,
                })
            } else {
                itemBounds.set(item, {
                    left: cellIndex,
                    right: cellIndex,
                })
            }
        }
    })
    return itemBounds
}

// A method for validating layout string rows and returning a 3d array. The
// first dimension is rows, the second dimension is columns and the third
// dimension is cell values. Cell values are comma separated and represent
// grid cells. Header and row size specifiers will only ever have a single
// entry in the third dimension. For example:
//       1fr 2fr
//   1fr A,B B
//   2fr A,B B
// will be parsed into:
//   [[['1fr'], ['2fr']], [['1fr], ['A', 'B'], ['B']], [['2fr'], ['A', 'B'], ['B']]]
export default (rows: string[]): string[][][] => {
    if (rows.length == 0) {
        throw `Cannot validate empty rows`
    }
    const columnHeaderValues = splitRow(rows[0])
    const validatedColumnHeaders = validateColumnHeaders(columnHeaderValues)
    if (rows.length == 1) {
        return [validatedColumnHeaders]
    }
    const columnHeaderCount = validatedColumnHeaders.length
    // If there is only a single header row value, then this is either a
    // row-only specificaction or a single cell grid. If the second row has two
    // entries it is the latter. If it has one entry it's the former. Otherwise
    // it's invalid. Given the results of this check, the 2nd row onwards should
    // have columnHeaderCount + 1 entries.
    let expectedRowSize = columnHeaderCount + 1
    if (columnHeaderCount === 1) {
        const secondRow = validateRow(splitRow(rows[1]), 1)
        if (secondRow.length > 2) {
            throw (
                `Row 1 has ${secondRow.length} entries but only a single ` +
                `column header is defined. It must define only a single ` +
                `entry for a row-only specification or two entries for a ` +
                `single cell grid.`
            )
        }
        if (secondRow.length == 1) {
            expectedRowSize = 1
        }
    }
    const validatedRows = [validatedColumnHeaders]

    let lastBounds = new Map<string, RowBounds>()
    for (let i = 1; i < rows.length; ++i) {
        const rowValues = validateRow(splitRow(rows[i]), i)
        const currentBounds = calculateRowBounds(rowValues)
        for (const key of currentBounds.keys()) {
            if (lastBounds.has(key)) {
                const lastBound = lastBounds.get(key)!
                const currentBound = currentBounds.get(key)!
                if (!rowBoundsEqual(lastBound, currentBound)) {
                    throw (
                        `${key} has bounds of ${lastBound.left}, ` +
                        `${lastBound.right} on row ${i - 1} and bounds of ` +
                        `${currentBound.left}, ${currentBound.right} on row ` +
                        `${i}. Bounds must match to form a rectangle.`
                    )
                    
                }
            }
        }
        lastBounds.clear()
        currentBounds.forEach((value, key) => {
            lastBounds.set(key, value)
        })
        if (rowValues.length != expectedRowSize) {
            throw (
                `Row ${i} has ${rowValues.length} values instead of ` +
                `${expectedRowSize}`   
            )
        }
        validatedRows.push(rowValues)
    }
    return validatedRows
}

export type {RowBounds}
export {EMPTY_CELL, calculateRowBounds, splitRow, validateColumnHeaders, validateRow}