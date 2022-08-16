import { css, type CSSObject } from '@emotion/css'
import { defineComponent, h } from 'vue'

// The `--env type=` value denoting a cypress run using the `cypress open`.
const OPEN_TEST_RUN = 'open'

const squareFillClass: CSSObject = {
    width: '100%',
    height: '100%',
    opacity: '0.3',
}

export const SquareFillComponent = defineComponent({
    props: {
        background: String
    },
    setup: (props) => {
        return () => {
            return h('div', {class: css([
                squareFillClass, {
                    backgroundColor: props.background
                }
            ])})
        }
    }
})

// Does not take screen shots in `cypress open` mode.
export const maybeTakeScreenshot = (screenshotName: string): void =>  {
    if (Cypress.env('type') != OPEN_TEST_RUN) {
        cy.compareSnapshot(screenshotName)
    }
}