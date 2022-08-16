import { mount } from '@cypress/vue'
import { h } from 'vue'
import Plaid from './Plaid.vue'
import { maybeTakeScreenshot } from './test-utils'

describe('<Plaid>', () => {
    it('mounts', () => {
        mount(Plaid)
        maybeTakeScreenshot('plaid')
    })

    it('renders column gaps', () => {
        mount(() => {
            return h(Plaid, {gridColumnGap: '10px'})
        })
        maybeTakeScreenshot('plaidWithColumnGap')
    })
    
    it('renders row gaps', () => {
        mount(() => {
            return h(Plaid, {gridRowGap: '10px'})
        })
        maybeTakeScreenshot('plaidWithRowGap')
    })

    it('renders column and row gaps', () => {
        mount(() => {
            return h(Plaid, {gridColumnGap: '10px', gridRowGap: '10px'})
        })
        maybeTakeScreenshot('plaidWithColumnAndRowGap')
    })
})