import React from 'react';
import { Award, ShieldCheck, Users } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <>
    <SEO 
      title="About Us | Skillzeno" 
      description="Skillzeno is a state-of-the-art educational and professional portal offering project experience and verified credentials." 
      canonical="/about"
    />
    <div className="container fade-in" style={{ maxWidth: '800px' }}>
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>

        <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '12px' }}>Empowering Future Tech Leaders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '16px', lineHeight: '1.7' }}>
          Skillzeno is a state-of-the-art educational and professional portal designed to offer high-quality learning materials, hands-on project experience, and verified credential distribution.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="feature-icon-wrapper" style={{ flexShrink: 0 }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Our Community First Vision</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              We build remote, project-centered environments where self-paced students learn, build, compile, test, and release clean software solutions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="feature-icon-wrapper" style={{ flexShrink: 0 }}>
            <Award size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Curriculum and Task Rigor</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Our internships guide students to write real backend routes, dynamic frontend pages, interactive state managers, and proper unit test scenarios.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="feature-icon-wrapper" style={{ flexShrink: 0 }}>
            <ShieldCheck size={24} style={{ color: 'var(--accent-success)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Authentic Blockchain Verification</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              We provide unique validation hashes searchable instantly by employers to verify certificates, duration, and performance history.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
