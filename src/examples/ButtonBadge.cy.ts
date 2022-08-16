import { mount } from '@cypress/vue'
import ButtonBadge from './ButtonBadge.vue'
import { maybeTakeScreenshot } from './test-utils'

describe('<ButtonBadge>', () => {
    it('renders correctly', () => {
        mount(ButtonBadge)
        maybeTakeScreenshot('buttonBadge')
    })
})