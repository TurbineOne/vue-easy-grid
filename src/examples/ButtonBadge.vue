<script lang="ts" setup>
import { css } from '@emotion/css'
import easyGrid from '../easy-grid'

const buttonGridClass = css`
    height: 300px;
    width: 300px;
`;

const ButtonGridComponent = easyGrid`
        270px       10px        10px        10px
10px    ..          B           B           B
10px    A           A,B         A,B         B
10px    A           A,B         A,B         B
70px    A           A           A           ..
`

const buttonClass = css`
    width: 100%;
	height: 100%;
	border: 1px solid black;
	border-radius: 10px;
	color: black;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: 'Roboto', sans-serif;
`

const badgeClass = css`
    width: 100%;
	height: 100%;
	border-radius: 50%;
	background-color: red;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: 'Roboto', sans-serif;
`

</script>

<template>
    <ButtonGridComponent :class="buttonGridClass">
        <template #A><div :class="buttonClass">Some Button</div></template>
        <template #B><div :class="badgeClass">2</div></template>
    </ButtonGridComponent>
</template>