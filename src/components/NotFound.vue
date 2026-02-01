<template>
  <div>
    <h1>{{ $ct('title') }}</h1>
    <p>{{ $ct('message') }}</p>
  </div>
</template>

<script setup>
import { componentTranslate } from '../i18n/utils.js'

const $ct = componentTranslate('NotFound')
</script>