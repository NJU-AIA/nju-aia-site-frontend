<script setup lang="ts">
import { computed } from 'vue';
import type { SlideLayoutNode } from '@/core/parser';
import ContentBlock from './ContentBlock.vue';

defineOptions({ name: 'SlideLayoutTree' });

const props = withDefaults(
  defineProps<{
    node: SlideLayoutNode;
    align?: 'start' | 'center';
  }>(),
  { align: 'start' },
);

const splitStyle = computed(() => {
  if (props.node.kind !== 'split') return undefined;
  const [first, second] = props.node.ratio;
  return props.node.direction === 'columns'
    ? { gridTemplateColumns: `${first}fr ${second}fr` }
    : { gridTemplateRows: `${first}fr ${second}fr` };
});
</script>

<template>
  <div
    v-if="node.kind === 'content'"
    class="layout-content"
    :class="{ 'layout-content--titled': node.title }"
  >
    <div v-if="node.title" class="layout-title">{{ node.title }}</div>
    <ContentBlock :elements="node.elements" :align="align" />
  </div>

  <div
    v-else
    class="layout-node"
    :class="{ 'layout-node--titled': node.title }"
  >
    <div v-if="node.title" class="layout-title">{{ node.title }}</div>

    <div
      class="layout-split"
      :class="`layout-split--${node.direction}`"
      :style="splitStyle"
      :data-layout-direction="node.direction"
      :data-layout-ratio="node.ratio.join(':')"
    >
      <div class="layout-split__child layout-split__child--first">
        <SlideLayoutTree :node="node.children[0]" :align="align" />
      </div>
      <div class="layout-split__child layout-split__child--second">
        <SlideLayoutTree :node="node.children[1]" :align="align" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-node,
.layout-content {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr);
}

.layout-node--titled,
.layout-content--titled {
  grid-template-rows: auto minmax(0, 1fr);
  row-gap: 10px;
}

.layout-title {
  min-width: 0;
  color: #2b252a;
  font-size: 17px;
  font-weight: 680;
  line-height: 1.3;
}

.layout-split {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.layout-split__child {
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.layout-split--columns > .layout-split__child--first { padding-right: 15px; }
.layout-split--columns > .layout-split__child--second {
  border-left: 1px solid #eaddea;
  padding-left: 15px;
}
.layout-split--rows > .layout-split__child--first { padding-bottom: 13px; }
.layout-split--rows > .layout-split__child--second {
  border-top: 1px solid #eaddea;
  padding-top: 13px;
}
</style>
