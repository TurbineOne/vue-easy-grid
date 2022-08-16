<script lang="ts" setup>
import { css } from '@emotion/css'
import easyGrid from '../easy-grid'
import { SquareFillComponent } from './test-utils'

const gridClass = css`
    position: absolute;
    height: 500px;
    width: 500px;
`;

const GridComponent = easyGrid`
    1fr
    50px
    2fr
`
</script>

<template>
    <GridComponent :class="gridClass">
        <SquareFillComponent background="red"/>
        <SquareFillComponent background="green"/>
        <SquareFillComponent background="blue"/>
    </GridComponent>
</template>