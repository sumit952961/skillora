import React from 'react';
import { Trophy } from 'lucide-react';
import SEO from '../components/SEO';

// ── Contests – Placeholder Page ──────────────────────────────────────────────
// Contest functionality will be implemented separately.
// Do not add features here until the requirements are provided.
// ─────────────────────────────────────────────────────────────────────────────

export default function Contests() {
  return (
    <>
      <SEO
        title="Contests | Skillzeno"
        description="Upcoming coding contests and challenges on Skillzeno."
        canonical="/contests"
      />
      <div className="container fade-in" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
        <Trophy size={56} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
        <h1 className="section-title" style={{ marginBottom: '12px' }}>Contests</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
          Exciting contests and challenges are coming soon. Stay tuned!
        </p>
      </div>
    </>
  );
}
