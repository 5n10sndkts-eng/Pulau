import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function MetaManager() {
    const location = useLocation()
    const path = location.pathname

    useEffect(() => {
        let title = 'Pulau | Discover Bali Your Way'
        const description = 'Exquisite Bali travel experiences tailored to your style. Plan, book, and explore the best of Bali.'

        if (path === '/') {
            title = 'Pulau | Home - Bali Experiences'
        } else if (path === '/explore') {
            title = 'Pulau | Explore - Discover New Adventures'
        } else if (path.startsWith('/experience/')) {
            title = 'Pulau | Experience Details'
        } else if (path.startsWith('/category/')) {
            const category = path.split('/').pop()
            title = `Pulau | ${category?.charAt(0).toUpperCase()}${category?.slice(1)} Adventures`
        } else if (path === '/onboarding') {
            title = 'Pulau | Personalize Your Journey'
        } else if (path === '/plan') {
            title = 'Pulau | My Trip Planner'
        } else if (path === '/checkout') {
            title = 'Pulau | Secure Checkout'
        } else if (path === '/profile') {
            title = 'Pulau | My Profile'
        } else if (path === '/saved') {
            title = 'Pulau | My Saved Experiences'
        } else if (path === '/trips') {
            title = 'Pulau | My Booked Trips'
        } else if (path.startsWith('/vendor')) {
            title = 'Pulau | Vendor Portal'
        } else if (path === '/login') {
            title = 'Pulau | Sign In'
        } else if (path === '/register') {
            title = 'Pulau | Create Account'
        }

        document.title = title

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute('content', description)
        }
    }, [path])

    return null
}
