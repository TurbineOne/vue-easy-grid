export interface ItemArea {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

type ParsedLayout = string[][][]

export const extractDimensions = (
    parsedLayout: ParsedLayout): Map<string, ItemArea> => {
    const itemAreas = new Map<string, ItemArea>()
    parsedLayout.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            column.forEach((item, itemIndex) => {
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
            })
        })
    })
    return itemAreas
}


// Defines a tagged template method for parsing a grid layout string. It returns
// 
export default (layoutStrings: string, ...values: any) => {

}