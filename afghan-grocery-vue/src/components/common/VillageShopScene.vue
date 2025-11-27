<template>
  <section class="village-shop-scene">
    <div class="container">
      <div class="scene-wrapper">
        <!-- 3D Canvas Container -->
        <div ref="canvasContainer" class="canvas-container"></div>
        
        <!-- Overlay Content -->
        <div class="content-overlay">
          <div class="content-card">
            <div class="icon-wrapper">
              <i class="bi bi-heart-fill"></i>
            </div>
            <h2 class="title">Send Food, Share Love</h2>
            <p class="description">
              Order essential groceries for your family in Afghanistan. 
              Fresh, quality products delivered to their doorstep with care and warmth.
            </p>
            <div class="action-buttons">
              <router-link to="/shop" class="btn btn-primary">
                <i class="bi bi-bag me-2"></i>Shop Now
              </router-link>
              <router-link to="/tracking" class="btn btn-outline-light">
                <i class="bi bi-box-seam me-2"></i>Track Order
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'

const canvasContainer = ref(null)
let scene, camera, renderer, animationFrameId
let person, teaCup, shop, sun, clouds = [], birds = [], trees = []

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (renderer) {
    renderer.dispose()
  }
})

function initScene() {
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB) // Sky blue
  scene.fog = new THREE.Fog(0x87CEEB, 10, 50)

  // Camera
  const aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100)
  camera.position.set(0, 3, 12)
  camera.lookAt(0, 2, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffd700, 0.8)
  sunLight.position.set(10, 15, 5)
  sunLight.castShadow = true
  sunLight.shadow.camera.left = -20
  sunLight.shadow.camera.right = 20
  sunLight.shadow.camera.top = 20
  sunLight.shadow.camera.bottom = -20
  scene.add(sunLight)

  // Create sun
  createSun()

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x7cb342,
    roughness: 0.8
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Create village shop
  createShop()

  // Create person sitting
  createPerson()

  // Create tea cup
  createTeaCup()

  // Create trees
  createTrees()

  // Create clouds
  createClouds()

  // Create birds
  createBirds()

  // Create flowers
  createFlowers()

  // Animate elements
  animateElements()
}

function createSun() {
  const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffd700,
    emissive: 0xffd700,
    emissiveIntensity: 1
  })
  sun = new THREE.Mesh(sunGeometry, sunMaterial)
  sun.position.set(10, 15, -5)
  scene.add(sun)

  // Sun glow
  const glowGeometry = new THREE.SphereGeometry(2, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffeb3b,
    transparent: true,
    opacity: 0.3
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  sun.add(glow)
}

function createShop() {
  shop = new THREE.Group()

  // Shop base (walls)
  const wallGeometry = new THREE.BoxGeometry(6, 3, 4)
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4a574,
    roughness: 0.7
  })
  const walls = new THREE.Mesh(wallGeometry, wallMaterial)
  walls.position.y = 1.5
  walls.castShadow = true
  walls.receiveShadow = true
  shop.add(walls)

  // Roof
  const roofGeometry = new THREE.ConeGeometry(4, 1.5, 4)
  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513,
    roughness: 0.8
  })
  const roof = new THREE.Mesh(roofGeometry, roofMaterial)
  roof.position.y = 3.75
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  shop.add(roof)

  // Door
  const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.1)
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 })
  const door = new THREE.Mesh(doorGeometry, doorMaterial)
  door.position.set(0, 1, 2.05)
  shop.add(door)

  // Window
  const windowGeometry = new THREE.BoxGeometry(1, 0.8, 0.1)
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.6
  })
  const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
  window1.position.set(-1.5, 2, 2.05)
  shop.add(window1)

  const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
  window2.position.set(1.5, 2, 2.05)
  shop.add(window2)

  // Shop sign
  const signGeometry = new THREE.BoxGeometry(2, 0.5, 0.1)
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0xe76f1a })
  const sign = new THREE.Mesh(signGeometry, signMaterial)
  sign.position.set(0, 3.2, 2.1)
  shop.add(sign)

  shop.position.set(0, 0, -2)
  scene.add(shop)
}

function createPerson() {
  person = new THREE.Group()

  // Body
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2f9d52 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.5
  body.castShadow = true
  person.add(body)

  // Head
  const headGeometry = new THREE.SphereGeometry(0.25, 16, 16)
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.25
  head.castShadow = true
  person.add(head)

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8)
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x2f9d52 })
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial)
  leftArm.position.set(-0.4, 0.7, 0)
  leftArm.rotation.z = Math.PI / 6
  leftArm.castShadow = true
  person.add(leftArm)

  const rightArm = new THREE.Mesh(armGeometry, armMaterial)
  rightArm.position.set(0.4, 0.7, 0.3)
  rightArm.rotation.z = -Math.PI / 4
  rightArm.rotation.x = Math.PI / 6
  rightArm.castShadow = true
  person.add(rightArm)
  person.userData.rightArm = rightArm

  // Legs (sitting position)
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.position.set(-0.2, 0.1, 0.3)
  leftLeg.rotation.x = Math.PI / 2
  leftLeg.castShadow = true
  person.add(leftLeg)

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
  rightLeg.position.set(0.2, 0.1, 0.3)
  rightLeg.rotation.x = Math.PI / 2
  rightLeg.castShadow = true
  person.add(rightLeg)

  person.position.set(2, 0.3, 1)
  scene.add(person)
}

function createTeaCup() {
  const cupGroup = new THREE.Group()

  // Cup
  const cupGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 16)
  const cupMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const cup = new THREE.Mesh(cupGeometry, cupMaterial)
  cup.castShadow = true
  cupGroup.add(cup)

  // Tea (liquid)
  const teaGeometry = new THREE.CylinderGeometry(0.095, 0.085, 0.12, 16)
  const teaMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513,
    transparent: true,
    opacity: 0.8
  })
  const tea = new THREE.Mesh(teaGeometry, teaMaterial)
  tea.position.y = 0.01
  cupGroup.add(tea)

  // Steam particles
  for (let i = 0; i < 5; i++) {
    const steamGeometry = new THREE.SphereGeometry(0.02, 8, 8)
    const steamMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    })
    const steam = new THREE.Mesh(steamGeometry, steamMaterial)
    steam.position.set(
      (Math.random() - 0.5) * 0.05,
      0.1 + i * 0.1,
      (Math.random() - 0.5) * 0.05
    )
    cupGroup.add(steam)
    cupGroup.userData.steam = cupGroup.userData.steam || []
    cupGroup.userData.steam.push(steam)
  }

  teaCup = cupGroup
  teaCup.position.set(2.5, 0.8, 1.3)
  scene.add(teaCup)
}

function createTrees() {
  for (let i = 0; i < 5; i++) {
    const tree = new THREE.Group()

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.25, 2, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1
    trunk.castShadow = true
    tree.add(trunk)

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(1, 8, 8)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
    foliage.position.y = 2.5
    foliage.castShadow = true
    tree.add(foliage)

    const x = (Math.random() - 0.5) * 20
    const z = -8 - Math.random() * 10
    tree.position.set(x, 0, z)
    tree.scale.set(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4)
    
    scene.add(tree)
    trees.push(tree)
  }
}

function createClouds() {
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group()

    for (let j = 0; j < 3; j++) {
      const cloudGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 8)
      const cloudMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      })
      const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial)
      cloudPart.position.set(j * 0.6 - 0.6, Math.random() * 0.2, Math.random() * 0.2)
      cloud.add(cloudPart)
    }

    cloud.position.set(
      (Math.random() - 0.5) * 30,
      8 + Math.random() * 4,
      -10 - Math.random() * 10
    )
    
    scene.add(cloud)
    clouds.push(cloud)
  }
}

function createBirds() {
  for (let i = 0; i < 4; i++) {
    const bird = new THREE.Group()

    // Simple bird shape using two triangles for wings
    const wingGeometry = new THREE.ConeGeometry(0.1, 0.3, 3)
    const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
    leftWing.rotation.z = Math.PI / 2
    leftWing.position.x = -0.15
    bird.add(leftWing)
    bird.userData.leftWing = leftWing

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial)
    rightWing.rotation.z = -Math.PI / 2
    rightWing.position.x = 0.15
    bird.add(rightWing)
    bird.userData.rightWing = rightWing

    bird.position.set(
      (Math.random() - 0.5) * 20,
      6 + Math.random() * 4,
      -5 - Math.random() * 10
    )
    
    scene.add(bird)
    birds.push(bird)
  }
}

function createFlowers() {
  for (let i = 0; i < 15; i++) {
    const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const colors = [0xff69b4, 0xffff00, 0xff0000, 0xff8c00]
    const flowerMaterial = new THREE.MeshStandardMaterial({ 
      color: colors[Math.floor(Math.random() * colors.length)]
    })
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial)
    
    flower.position.set(
      (Math.random() - 0.5) * 15,
      0.1,
      (Math.random() - 0.5) * 15
    )
    
    scene.add(flower)
  }
}

function animateElements() {
  // Animate sun rotation
  gsap.to(sun.rotation, {
    y: Math.PI * 2,
    duration: 60,
    repeat: -1,
    ease: 'none'
  })

  // Animate clouds drifting
  clouds.forEach((cloud, index) => {
    gsap.to(cloud.position, {
      x: cloud.position.x + 10,
      duration: 30 + index * 5,
      repeat: -1,
      yoyo: true,
      ease: 'none'
    })
  })

  // Animate birds flying
  birds.forEach((bird, index) => {
    // Wing flapping
    gsap.to(bird.userData.leftWing.rotation, {
      z: Math.PI / 2 + 0.3,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
    
    gsap.to(bird.userData.rightWing.rotation, {
      z: -Math.PI / 2 - 0.3,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })

    // Flying path
    gsap.to(bird.position, {
      x: bird.position.x + 15,
      y: bird.position.y + Math.sin(index) * 2,
      duration: 20 + index * 3,
      repeat: -1,
      yoyo: true,
      ease: 'none'
    })
  })

  // Animate person drinking tea
  if (person && person.userData.rightArm) {
    gsap.to(person.userData.rightArm.rotation, {
      x: Math.PI / 3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
  }

  // Animate steam rising
  if (teaCup && teaCup.userData.steam) {
    teaCup.userData.steam.forEach((steam, index) => {
      gsap.to(steam.position, {
        y: steam.position.y + 0.5,
        duration: 2 + index * 0.2,
        repeat: -1,
        ease: 'power1.out',
        onRepeat: () => {
          steam.position.y = 0.1 + index * 0.1
        }
      })

      gsap.to(steam.material, {
        opacity: 0,
        duration: 2 + index * 0.2,
        repeat: -1,
        ease: 'power1.out',
        onRepeat: () => {
          steam.material.opacity = 0.5
        }
      })
    })
  }

  // Gentle tree swaying
  trees.forEach((tree, index) => {
    gsap.to(tree.rotation, {
      z: Math.sin(index) * 0.05,
      duration: 3 + index * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
  })
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  
  // Gentle camera movement
  const time = Date.now() * 0.0001
  camera.position.x = Math.sin(time) * 0.5
  camera.lookAt(0, 2, 0)
  
  renderer.render(scene, camera)
}

function handleResize() {
  if (!canvasContainer.value) return
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
</script>

<style scoped>
.village-shop-scene {
  position: relative;
  padding: 0;
  margin: 3rem 0;
  overflow: hidden;
}

.scene-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
  z-index: 10;
}

.content-card {
  max-width: 500px;
  color: white;
  animation: fadeInLeft 1s ease-out;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(231, 111, 26, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.icon-wrapper i {
  font-size: 2rem;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.95);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-buttons .btn {
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.action-buttons .btn-primary {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-secondary));
  border: none;
}

.action-buttons .btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(231, 111, 26, 0.5);
}

.action-buttons .btn-outline-light {
  border: 2px solid white;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.action-buttons .btn-outline-light:hover {
  background: white;
  color: var(--bs-primary);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .scene-wrapper {
    height: 500px;
    border-radius: 16px;
  }

  .content-overlay {
    padding: 2rem;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
  }

  .content-card {
    max-width: 100%;
  }

  .title {
    font-size: 2rem;
  }

  .description {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .scene-wrapper {
    height: 450px;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .icon-wrapper i {
    font-size: 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }
}
</style>
