import React from 'react'
import Footer from '../Components/Footer'

function Home() {
    return (
        <div id='home' style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
            <div style={{ paddingTop: 'var(--header-height)' }} />
            
            {/* Hero Section */}
            <section className="hero" style={{ 
                padding: '48px 24px 64px', 
                textAlign: 'center',
                background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="hero-card card glass" style={{ 
                        overflow: 'hidden', 
                        background: 'var(--color-surface)', 
                        color: 'var(--color-text)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                    }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img 
                                src="/assets/images/school_building_placeholder.jpg" 
                                alt="RMS" 
                                style={{ 
                                    width: '100%', 
                                    height: 280, 
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '100px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
                            }} />
                        </div>
                        <div style={{ padding: 'var(--space-4)' }}>
                            <h1 style={{ 
                                marginTop: 8, 
                                color: 'var(--color-text)',
                                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                fontWeight: '700',
                                marginBottom: '16px',
                                lineHeight: '1.2'
                            }}>
                                RMS HIGH SCHOOL BALICHELA - Digital Library
                            </h1>
                            <p style={{ 
                                fontStyle: 'italic', 
                                color: 'var(--color-muted)',
                                fontSize: '1.1rem',
                                marginTop: '12px'
                            }}>
                                <strong>"Excellence in Education, Excellence in Learning"</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container" style={{ 
                paddingTop: 'var(--space-4)', 
                paddingBottom: 'var(--space-5)',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px'
            }}>
                <section style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-5)'
                }}>
                    {/* Main Content Area */}
                    <div style={{ 
                        color: 'var(--color-text)',
                        gridColumn: 'span 2',
                        background: 'var(--color-surface)',
                        padding: 'var(--space-4)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-primary)',
                            borderBottom: '3px solid var(--color-primary)',
                            paddingBottom: '12px'
                        }}>
                            About Our Library
                        </h2>
                        <p style={{ 
                            fontSize: '1.1rem', 
                            lineHeight: '1.8',
                            marginBottom: 'var(--space-4)',
                            color: 'var(--color-text)'
                        }}>
                            RMS High School Balichela Digital Library holds thousands of books across academic and recreational categories. Our mission is to support teaching and learning across classes 6-12.
                        </p>

                        <h3 style={{ 
                            fontSize: '1.5rem', 
                            marginTop: 'var(--space-4)',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📋 Library Rules
                        </h3>
                        <ul style={{ 
                            paddingLeft: '24px',
                            lineHeight: '2',
                            fontSize: '1.05rem'
                        }}>
                            <li style={{ marginBottom: '12px' }}>Students may borrow up to <strong>3 books</strong> for <strong>15 days</strong>.</li>
                            <li style={{ marginBottom: '12px' }}>Teachers may borrow up to <strong>5 books</strong> for <strong>30 days</strong>.</li>
                            <li style={{ marginBottom: '12px' }}>Late fee: <strong style={{ color: 'var(--color-danger, #e74c3c)' }}>₹2 per day</strong> after due date.</li>
                        </ul>

                        <h3 style={{ 
                            fontSize: '1.5rem', 
                            marginTop: 'var(--space-4)',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            💻 Digital Resources
                        </h3>
                        <p style={{ 
                            fontSize: '1.05rem', 
                            lineHeight: '1.8',
                            color: 'var(--color-text)'
                        }}>
                            Access selected e-resources and scanned notes from the library portal.
                        </p>
                    </div>

                    {/* Sidebar Stats */}
                    <aside className="card" style={{ 
                        background: 'linear-gradient(135deg, var(--color-primary, #3498db) 0%, var(--color-secondary, #2980b9) 100%)',
                        color: 'white',
                        padding: 'var(--space-4)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(52, 152, 219, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '150px',
                            height: '150px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%'
                        }} />
                        <h3 style={{ 
                            fontSize: '1.5rem',
                            marginBottom: 'var(--space-3)',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            📊 Quick Stats
                        </h3>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <li style={{ 
                                marginBottom: '16px',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                                Total Books: <strong style={{ fontSize: '1.3rem' }}>5000+</strong>
                            </li>
                            <li style={{ 
                                marginBottom: '16px',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                                Active Students: <strong>—</strong>
                            </li>
                            <li style={{ 
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                                Issued Books Today: <strong>—</strong>
                            </li>
                        </ul>
                    </aside>
                </section>

                {/* Recent Arrivals */}
                <section style={{ 
                    marginTop: 'var(--space-5)',
                    background: 'var(--color-surface)',
                    padding: 'var(--space-4)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                    <h3 style={{ 
                        fontSize: '1.8rem',
                        marginBottom: 'var(--space-3)',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📚 Recent Arrivals
                    </h3>
                    <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-3)', 
                        overflowX: 'auto',
                        paddingBottom: '16px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--color-primary) var(--color-surface)'
                    }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div 
                                key={num}
                                className="card" 
                                style={{ 
                                    minWidth: 180,
                                    height: 260,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%'
                                }} />
                                <span style={{ position: 'relative', zIndex: 1 }}>Book {num}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    )
}

export default Home