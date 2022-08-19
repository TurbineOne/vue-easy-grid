<script lang="ts" setup>
import { css } from '@emotion/css'
import easyGrid from '../easy-grid'
import { defineProps } from 'vue'
import { SquareFillComponent } from './test-utils'

const props = defineProps({
    gridColumnGap: {type: String, required: false},
    gridRowGap: {type: String, required: false},
})

const gridClass = css`
    position: absolute;
    height: 500px;
    width: 500px;
`;

const GridComponent = easyGrid`
    1fr     1fr     1fr     1fr     1fr
1fr A,H     A,I     A,J     A,K     A,L
1fr B,H     B,I     B,J     B,K     B,L
1fr C,H     C,I     C,J     C,K     C,L
1fr D,H     D,I     D,J     D,K     D,L
1fr E,H     E,I     E,J     E,K     E,L
`
</script>

<template>
    <GridComponent :class="gridClass"
        :gridColumnGap="props.gridColumnGap"
        :gridRowGap="props.gridRowGap">
        <template #A><SquareFillComponent background="red"/></template>
        <template #B><SquareFillComponent background="blue"/></template>
        <template #C><SquareFillComponent background="red"/></template>
        <template #D><SquareFillComponent background="blue"/></template>
        <template #E><SquareFillComponent background="red"/></template>
        <template #H><SquareFillComponent background="blue"/></template>
        <template #I><SquareFillComponent background="red"/></template>
        <template #J><SquareFillComponent background="blue"/></template>
        <template #K><SquareFillComponent background="red"/></template>
        <template #L><SquareFillComponent background="blue"/></template>
    </GridComponent>
</template>