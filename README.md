# vue-easy-grid

vue-easy-grid is a Vue component factory that provides a declarative layout mechanism for utilizing [CSS grid layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout). It uses ASCII layout descriptions to generate layout components that arrange child components according to the defined grid.

It draws inspiration from [easy-grid](https://github.com/google/easy-grid/) for React.

<table>
	<thead>
		<td>
			<b>Code</b>
		</td>
		<td>
			<b>Rendered</b>
		</td>
	</thead>
	<tr>
		<td>
            <a href="https://github.com/TurbineOne/vue-easy-grid/blob/e84d7f8226647f4ae34553919d192d5e4ad3eb98/src/examples/Plaid.vue">Plaid SFC</a>
		</td>
		<td>
            <img width="289" alt="code-one" src="https://raw.githubusercontent.com/TurbineOne/vue-easy-grid/main/cypress/snapshots/base/Plaid.cy.ts/plaid-base.png">
		</td>
	</tr>
	<tr>
		<td>
			<a href="https://github.com/TurbineOne/vue-easy-grid/blob/e84d7f8226647f4ae34553919d192d5e4ad3eb98/src/examples/ButtonBadge.vue">ButtonBadge SFC</a>
		</td>
		<td>
			<img width="307" alt="render-two" src="https://raw.githubusercontent.com/TurbineOne/vue-easy-grid/main/cypress/snapshots/base/ButtonBadge.cy.ts/buttonBadge-base.png">
		</td>
	</tr>
</table>

## Getting Started

### Prerequisites

Make sure you have the [npm package manager](https://www.npmjs.com/get-npm) installed on your development machine.

### Installing

Clone the git repository to a local directory:

```
git clone git@github.com:google/easy-grid.git
cd easy-grid
```

Run `npm install` and then run the examples:

```
npm install
npm run examples
```

This will start a browser pointing at 'index.html' in the [examples subdirectory](https://github.com/google/easy-grid/tree/master/examples).

To play around with the library, make changes to the [examples.js](https://github.com/google/easy-grid/blob/master/examples/examples.js) React app and re-run `npm run examples`.


## Running the unit tests

To run the unit tests, type:
```
npm run test:unit
```

To run the [cypress component tests](https://docs.cypress.io/guides/component-testing/quickstart-vue), type:
```
npm run test:component
```
This will open the cypress component testing window and run the tests in your preferred browser. The test specs are
stored in the `src/examples` directory, and provide the best means to play with the grid component. The cypress
framework will watch for changes and re-run affected tests when necessary.

The project also includes screenshot tests using [cypress-visual-regression](https://github.com/cypress-visual-regression/cypress-visual-regression).
To re-generate the base images, run:
```
npm run test:screenshot:base
```
Regenerating the base images should only be done when known breaking changes to the UI have been made.

Otherwise, using:
```
npm run test:screenshot
```
Will compare the rendered components against the images in `cypress/snapshots/base` to confirm that changes have not
affected the rendering.

## Importing
vue-easy-grid exports an `easyGrid` factory method:

```typescript
import easyGrid from '../easy-grid'
```

## Usage
The exported `easyGrid` method is used to create layout components based on an ASCII representations of the desired layout grid. For instance:

~~~typescript
const TwoByTwoLayout = easyGrid`
    1fr   1fr
1fr A     A,B
1fr A     A,B
`
~~~
defines a Vue component, TwoByTwoLayout, that will distribute it's child elements along a two by two grid. element "A" will take up the entire grid, while element "B" will overlap element "A" and take up the right half of the grid. The two rows will each have the same height, namely half the height of the parent element. Likewise, the two columns will each have the same width, or half the width of the parent component.

The returned component will expect two named slot templates corresponding to the `A` and `B` in the layout definition. e.g.:
```html
<TwoByTwoLayout>
    <template #A>...</template>
    <template #B>...</template>
</TwoByTwoLayout>
```

### Grid Definition Syntax
Grids are defined by a back-tick ``` ` ``` string. Spaces and new-lines are non-trivial as they are used to parse the grid definition from the string.

Row and column header definitions use the syntax defined for [grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows):

 **Type** | **Syntax** | **Usage** |
----------|:----------:|-----------|
*Flex* | *n*fr | Using a [flex-value](https://developer.mozilla.org/en-US/docs/Web/CSS/flex_value) allows rows and columns to be defined by distributing space proportionally between them. |
*Percentage* | *n*% | [Percentage values](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage) define the size of a column or row relative to its parent container. |
*Length* | *n*px, *n*em, etc. | All standard [length values](https://developer.mozilla.org/en-US/docs/Web/CSS/length) can be used to give rows or columns fixed heights and widths respectively. |

`min-max` and `fit-content` are also supported. `masonry`, `subgrid` and `repeat` have not yet been added. Also, [`linenames`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#values) are not supported at this time.


#### Column Headers
The first line of the string is a space-delimited definition of **column headers**. A component can be defined by only using column headers. For instance,

```typescript
const ColumnsOnly = easyGrid`
	1fr 2fr 1fr
`
```
defines a `ColumnsOnly` component that will arrange its children in 3 columns. The first and last column will be half the size of the middle column.

A column-only component expects a number of child elements in the default slot corresponding to the number of columns defined, and does not require
the use of named slots. e.g.:
```html
<ColumnsOnly>
    <div>...</div>
    <div>...</div>
    <div>...</div>
</ColumnsOnly>
```

#### Row Headers
Each line after the first line defines a new row in the grid. The first element in the space-deilimited row definition defines the height of that row, and is called the **row header**. However, similar to column-only grid definitions, row-only grid defintions can be created by only specifying row headers on each new line. For instance,

```javascript
const RowsOnly = easyGrid`
	10px
	50px
	100px
`
```
defines a `RowsOnly` component that will give each of its three child components heights of 10 pixels, 50 pixels and 100 pixels respectively. Like the
column-only version above, named slots are not used for children and the number of child elements should equal the number of defined rows.

#### Grid Areas
Using a combination of column headers and row headers, a grid is defined. The cells of the grid should be used to define **grid areas**. Grid areas are continuous square areas defined by an arbitrary identifier being placed in a **grid cell**. For example, the following grid defines two grid areas, one denoted by "A" and one denoted by "B".

```javascript
const SomeGrid = easyGrid`
      1fr    2fr    3fr
1fr   A      A,B    A,B
2fr   A      A,B    A,B
`
```
Grid area defintions use commas to separate multiple overlapping grid areas identifiers in a given grid cell.

##### Overlap
Grid areas can overlap, as seen in the example above. This overlap defines a z-ordering. When rendered, an area will be drawn on top of any area it overlaps. **Grid areas are alphabetically ordered. Later areas will be rendered on top of earlier ones.** A grid cell containing grid area defintions `A,D,C` will be ordered as `A,C,D` and will render area `D` on top of area `C` on top of area `A`.

##### Empty Cells
Empty grid cells can be denoted by `..`. For instance,

```javascript
const SpacerGrid = easyGrid`
       25%   50%   25%
25%    ..    ..    ..
50%    ..    A     ..
25%    ..    ..    ..
`
```
defines a `SpacerGrid` component that has a single grid area with a 10px border around it.

#### Grid Component
As mentioned above, the result of calling the `easyGrid` factory method with a grid definition is a Vue component. The returned component has the following expectations:

* The number of child components should exactly equal the number of defined **grid areas**, **columns headers** in a column-only table or **row headers** in a row-only table.
* For components that define a grid (as opposed to row-only or column-only components), the children should be wrapped by [named slot templates](https://vuejs.org/guide/components/slots.html#named-slots).


```typescript
const Simple = easyGrid`
      1fr    1fr
1fr   A      A
1fr   B      B
`
```
```html
<!-- Error: names slot B not found -->
<Simple>
	<template #A><Child/></template>
</Simple>
<!-- The second child is grid area "A", the first is grid area "B" -->
<Simple>
    <!-- Order doesn't matter: B will be rendered on top of A -->
	<template #B><Child item="B"/></template>
	<template #A><Child item="A"/></template>
</Simple>
```

Grid components can also be styled via the `:class` property.

```typescript
const Simple = easyGrid`
     1fr  1fr
1fr   A    A
1fr   B    B
`
```
```html
<Simple :class="someRuntimeClass">
    ...
</Simple>
```
All class properties are applied to the grid container, so these class properties can include grid container CSS properties that can directly
modify the grid layout.

Lastly, the grid component defines the `gridColumnGap` and `gridRowGap` properties that correspond to the [column-gap](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap) and [row-gap](https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap) CSS grid styles. They can be used to add gutters to the defined
grid:

```html
<Simple :class="someRuntimeClass" gridColumnGap="10px" gridRowGap="10px">
    ...
</Simple>
```

## Built With

* [Vue](https://vuejs.org/) - An approachable, performant and versatile framework for building web user interfaces.
* [Emotion](https://emotion.sh/docs/introduction) - Emotion is a library designed for writing css styles with JavaScript.

## License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* This is a re-write of [easy-grid] for Vue. It has better validation and testing, but is mostly the same functionally.