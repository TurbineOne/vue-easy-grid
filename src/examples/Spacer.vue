<script lang="ts" setup>
import { css } from '@emotion/css'
import easyGrid from '../easy-grid'
import { SquareFillComponent } from './test-utils'

const spacerGridClass = css`
    height: 300px;
	width: 300px;
	border: 1px solid black;
`;

const SpacerComponent = easyGrid`
	     25% 50% 25%
	25%  ..  ..  ..
	50%  ..  A   ..
	25%  ..  ..  ..
`
</script>

<template>
    <SpacerComponent :class="spacerGridClass">
        <template #A><SquareFillComponent background="red"/></template>
    </SpacerComponent>
</template>