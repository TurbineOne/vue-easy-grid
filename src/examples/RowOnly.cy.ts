import { mount } from '@cypress/vue'
import RowOnly from './RowOnly.vue'
import { maybeTakeScreenshot } from './test-utils'

describe('<RowOnly>', () => {
    it('mounts', () => {
        mount(RowOnly)
        maybeTakeScreenshot('rowOnly')
    })
})