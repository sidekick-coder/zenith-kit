<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#client/lib/utils'

const props = defineProps<{
  tag?: keyof HTMLElementTagNameMap
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <component
    :is="props.tag || 'div'"
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        props.class,
      )
    "
  >
    <slot />
  </component>
</template>
