<template>
  <div class="price-range-filter">
    <label class="form-label fw-semibold">{{ $t('filters.priceRange') }}</label>
    <div class="d-flex align-items-center gap-2 mb-3">
      <input
        v-model.number="localMin"
        type="number"
        class="form-control form-control-sm"
        style="width: 80px;"
        :placeholder="$t('filters.min')"
        @input="updateRange"
      />
      <span>-</span>
      <input
        v-model.number="localMax"
        type="number"
        class="form-control form-control-sm"
        style="width: 80px;"
        :placeholder="$t('filters.max')"
        @input="updateRange"
      />
      <span class="small">{{ $t('common.afn') }}</span>
    </div>
    <div class="position-relative mb-2" style="height: 40px;">
      <input
        v-model.number="localMin"
        type="range"
        :min="absoluteMin"
        :max="absoluteMax"
        :step="step"
        class="form-range position-absolute w-100 slider slider-min"
        @input="updateRange"
      />
      <input
        v-model.number="localMax"
        type="range"
        :min="absoluteMin"
        :max="absoluteMax"
        :step="step"
        class="form-range position-absolute w-100 slider slider-max"
        @input="updateRange"
      />
    </div>
    <div class="d-flex justify-content-between small text-muted">
      <span>{{ localMin }} {{ $t('common.afn') }}</span>
      <span>{{ localMax }} {{ $t('common.afn') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5000
  },
  absoluteMin: {
    type: Number,
    default: 0
  },
  absoluteMax: {
    type: Number,
    default: 5000
  },
  step: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['update:min', 'update:max'])

const localMin = ref(props.min)
const localMax = ref(props.max)

watch(() => props.min, (newVal) => {
  localMin.value = newVal
})

watch(() => props.max, (newVal) => {
  localMax.value = newVal
})

function updateRange() {
  // Ensure min doesn't exceed max
  if (localMin.value > localMax.value) {
    localMin.value = localMax.value
  }
  
  emit('update:min', localMin.value)
  emit('update:max', localMax.value)
}
</script>

<style scoped>
.slider {
  pointer-events: none;
}

.slider::-webkit-slider-thumb {
  pointer-events: all;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  pointer-events: all;
  cursor: pointer;
}
</style>
