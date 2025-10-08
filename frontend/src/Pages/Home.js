import React from 'react'
import Footer from '../Components/Footer'

function Home() {
    return (
        <div id='home' style={{ minHeight: '100vh' }}>
            <div style={{ paddingTop: 'var(--header-height)' }} />
            <section className="hero" style={{ padding: '36px 24px', textAlign: 'center' }}>
                <div className="container">
                    <div className="hero-card card glass" style={{ overflow: 'hidden', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                        <img src="/assets/images/school_building_placeholder.jpg" alt="RMS" style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                        <div style={{ padding: 'var(--space-3)' }}>
                            <h1 style={{ marginTop: 8, color: 'var(--color-text)' }}>RMS HIGH SCHOOL BALICHELA - Digital Library</h1>
                            <p style={{ fontStyle: 'italic', color: 'var(--color-muted)' }}><strong>"Excellence in Education, Excellence in Learning"</strong></p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container" style={{ paddingTop: 'var(--space-4)' }}>
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-4)' }}>
                    <div style={{ color: 'var(--color-text)' }}>
                        <h2>About Our Library</h2>
                        <p>RMS High School Balichela Digital Library holds thousands of books across academic and recreational categories. Our mission is to support teaching and learning across classes 6-12.</p>

                        <h3>Library Rules</h3>
                        <ul>
                            <li>Students may borrow up to 3 books for 15 days.</li>
                            <li>Teachers may borrow up to 5 books for 30 days.</li>
                            <li>Late fee: ₹2 per day after due date.</li>
                        </ul>

                        <h3>Digital Resources</h3>
                        <p>Access selected e-resources and scanned notes from the library portal.</p>
                    </div>
                    <aside className="card" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                        <h3>Quick Stats</h3>
                        <ul>
                            <li>Total Books: <strong>5000+</strong></li>
                            <li>Active Students: —</li>
                            <li>Issued Books Today: —</li>
                        </ul>
                    </aside>
                </section>

                <section style={{ marginTop: 'var(--space-4)' }}>
                    <h3>Recent Arrivals</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto' }}>
                        <div className="card" style={{ minWidth: 160 }}>Book 1</div>
                        <div className="card" style={{ minWidth: 160 }}>Book 2</div>
                        <div className="card" style={{ minWidth: 160 }}>Book 3</div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    )
}

export default Home
