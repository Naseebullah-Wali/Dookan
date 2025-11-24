import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

    const itemCount = computed(() => {
        return items.value.reduce((total, item) => total + item.quantity, 0)
    })

    const subtotal = computed(() => {
        return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
    })

    const deliveryFee = computed(() => {
        return subtotal.value > 5000 ? 0 : 200
    })

    const total = computed(() => {
        return subtotal.value + deliveryFee.value
    })

    function addToCart(product, quantity = 1) {
        const existingItem = items.value.find(item => item.id === product.id)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            items.value.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size: product.size,
                quantity
            })
        }

        saveCart()
    }

    function removeFromCart(productId) {
        items.value = items.value.filter(item => item.id !== productId)
        saveCart()
    }

    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        const item = items.value.find(item => item.id === productId)
        if (item) {
            item.quantity = quantity
            saveCart()
        }
    }

    function clearCart() {
        items.value = []
        saveCart()
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(items.value))
    }

    return {
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    }
})
