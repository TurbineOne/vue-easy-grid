import { mount } from '@cypress/vue'
import ColumnOnly from './ColumnOnly.vue'
import { maybeTakeScreenshot } from './test-utils'

describe('<ColumnOnly>', () => {
    it('mounts', () => {
        mount(ColumnOnly)
        maybeTakeScreenshot('columnOnly')
    })
})