import { mount } from '@cypress/vue'
import Spacer from './Spacer.vue'
import { maybeTakeScreenshot } from './test-utils'

describe('<Spacer>', () => {
    it('mounts', () => {
        mount(Spacer)
        maybeTakeScreenshot('spacer')
    })
})