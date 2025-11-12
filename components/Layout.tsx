import React, { ReactNode } from 'react'
import Header from './Header'
import { Footer } from './Footer'

function Layout({ children }: { children: ReactNode }) {
    return <main>
        <Header />
        {children}
        <Footer />
    </main>
}

export default Layout