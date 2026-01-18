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

    // Delivery fee logic centralized here. It uses a per-city mapping with a free-threshold
    const deliveryCity = ref(localStorage.getItem('deliveryCity') || 'kandahar')

    // const deliveryFeesMap = {
    //     kandahar: 600
    // }

    function setDeliveryCity(city) {
        deliveryCity.value = city
        localStorage.setItem('deliveryCity', city)
    }

    const deliveryFee = computed(() => {
        // Free if subtotal above threshold, else use city specific fee or default
        // if (subtotal.value > 5000) return 0
        // return deliveryFeesMap[deliveryCity.value] || 200
        return 200
    })

    const total = computed(() => {
        return subtotal.value + deliveryFee.value
    })

    function addToCart(product, quantity = 1) {
        const existingItem = items.value.find(item => item.id === product.id)

        if (existingItem) {
            // Update stock if it's missing (for old cart items)
            if (!existingItem.stock && product.stock) {
                existingItem.stock = product.stock
            }

            // Check stock limit
            const itemStock = existingItem.stock || Infinity
            const newQuantity = existingItem.quantity + quantity

            if (itemStock !== Infinity && newQuantity > itemStock) {
                window.showToast(`Cannot add more. Only ${itemStock} in stock`, 'warning')
                return
            }
            existingItem.quantity = newQuantity
        } else {
            // Check if requested quantity exceeds stock
            if (product.stock && quantity > product.stock) {
                window.showToast(`Cannot add ${quantity}. Only ${product.stock} in stock`, 'warning')
                return
            }
            items.value.push({
                id: product.id,
                name: product.name,
                name_en: product.name_en,
                name_ps: product.name_ps,
                name_fa: product.name_fa,
                name_de: product.name_de,
                name_fr: product.name_fr,
                price: product.price,
                image: product.image,
                size: product.size,
                weight: product.weight,
                supplier: product.supplier,
                stock: product.stock || 999,
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
        const item = items.value.find(item => item.id === productId)

        if (!item) return

        // Validate quantity
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        // Check stock limit (handle old cart items without stock field)
        const itemStock = item.stock || Infinity
        if (itemStock !== Infinity && quantity > itemStock) {
            window.showToast(`Cannot exceed available stock (${itemStock})`, 'warning')
            item.quantity = itemStock
            saveCart()
            return
        }

        item.quantity = quantity
        saveCart()
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
        deliveryCity,
        deliveryFee,
        total,
        setDeliveryCity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    }
})
