<template>
  <div class="hero-background-mesh" ref="container">
    <div class="mesh-blob blob-1" :style="blob1Style"></div>
    <div class="mesh-blob blob-2"></div>
    <div class="mesh-blob blob-3"></div>
    <div class="mesh-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const container = ref(null)
const mouseX = ref(0)
const mouseY = ref(0) // Start off-screen or center? Center is safer.

// Smooth interpolation for the "follow" effect
const currentX = ref(0)
const currentY = ref(0)
let animationFrameId = null

const blob1Style = computed(() => {
  return {
    transform: `translate(${currentX.value}px, ${currentY.value}px)`
  }
})

const handleMouseMove = (event) => {
  // Center the blob on the mouse
  // Blob is 600x600, so offset by 300
  mouseX.value = event.clientX - 300
  mouseY.value = event.clientY - 300
}

const animate = () => {
  // Linear interpolation (Lerp) for smooth following: slower factor
  const ease = 0.03
  currentX.value += (mouseX.value - currentX.value) * ease
  currentY.value += (mouseY.value - currentY.value) * ease
  
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  // Set initial position to center
  currentX.value = window.innerWidth / 2 - 300
  currentY.value = window.innerHeight / 2 - 300
  mouseX.value = currentX.value
  mouseY.value = currentY.value

  window.addEventListener('mousemove', handleMouseMove)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.hero-background-mesh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f8f9fa;
  z-index: 1;
}

.mesh-blob {
  position: absolute;
  filter: blur(80px);
  opacity: 0.6;
  border-radius: 50%;
  will-change: transform; /* Optimize for performance */
}

/* Blob 1: Pink (Follows Mouse) */
.blob-1 {
  background-color: rgba(255, 71, 111, 0.4); /* Reduced opacity on color level */
  opacity: 0.5; /* Keeping balanced opacity */
  width: 600px;
  height: 600px;
  top: 0;
  left: 0;
  /* Removed animation: float so it tracks mouse strictly (with lerp) */
}

/* Blob 2: Silver (Auto Float) */
.blob-2 {
  background-color: #B2BEC3;
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: -100px;
  animation: float 25s infinite ease-in-out reverse;
  animation-delay: -5s;
}

/* Blob 3: Pale Pink (Auto Float) */
.blob-3 {
  background-color: rgb(255, 235, 240);
  width: 400px;
  height: 400px;
  top: 40%;
  left: 40%;
  animation: float 20s infinite ease-in-out;
  animation-delay: -10s;
}

.mesh-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(30px);
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, 50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}
</style>
