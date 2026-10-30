'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRules() {
      try {
        const res = await fetch('/api/rules');
        const data = await res.json();
        setRules(data.rules || []);
      } catch (err) {
        console.error('Failed to fetch rules:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const removeRule = async (id: string) => {
    if (confirm('Are you sure you want to remove this combination?')) {
      try {
        const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setRules(rules.filter(r => r.id !== id));
        } else {
          alert('Failed to delete rule.');
        }
      } catch (err) {
        console.error('Failed to delete rule:', err);
        setRules(rules.filter(r => r.id !== id));
      }
    }
  };

  const editRule = (id: string) => {
    router.push(`/admin/rules/${id}/edit`);
  };

  const totalConditions = rules.reduce((acc, r) => acc + (r.conditions?.length || 0), 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem', fontSize: '1.6rem' }}>Rule Management</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.88rem' }}>Create and manage your astrological rule library</p>
        </div>
        <Link href="/admin/rules/new">
          <button className="btn-primary">✦ Create New Rule</button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div className="stat-card fade-in-up stagger-1">
          <div className="stat-value">{loading ? '–' : rules.length}</div>
          <div className="stat-label">Active Rules</div>
        </div>
        <div className="stat-card fade-in-up stagger-2">
          <div className="stat-value">{loading ? '–' : totalConditions}</div>
          <div className="stat-label">Conditions</div>
        </div>
        <div className="stat-card fade-in-up stagger-3">
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>●</div>
          <div className="stat-label">Engine Active</div>
        </div>
      </div>

      {/* Rules List */}
      <div className="glass-panel-static fade-in-up stagger-4" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-saffron)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ opacity: 0.5 }}>📜</span> Active Combinations
        </h3>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '2rem 0' }}>
            <div className="cosmic-spinner-sm" style={{ color: 'var(--primary-saffron)' }} />
            <span className="text-muted">Loading rules from database...</span>
          </div>
        ) : rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '0.75rem' }}>☉</div>
            <p className="text-muted" style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>No active combinations in the database.</p>
            <Link href="/admin/rules/new">
              <button className="btn-outline">Create Your First Rule</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rules.map((rule, idx) => (
              <div key={rule.id} className={`rule-card fade-in-up stagger-${Math.min(idx + 1, 9)}`}>
                {/* Rule Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{rule.name}</h4>
                    <span className={`badge ${rule.logic === 'OR' ? 'badge-rose' : 'badge-purple'}`}>{rule.logic || 'AND'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => editRule(rule.id)} className="btn-ghost">
                      ✎ Edit
                    </button>
                    <button onClick={() => removeRule(rule.id)} className="btn-danger">
                      ✕ Remove
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.88rem', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                  {rule.description}
                </p>

                {/* Conditions */}
                <div style={{ padding: '0.6rem 0.85rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Conditions ({rule.conditions?.length || 0})
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.83rem', color: 'var(--foreground-muted)' }}>
                    {rule.conditions?.map((cond: any, i: number) => (
                      <li key={i} style={{ marginBottom: '0.15rem' }}>
                        <strong style={{ color: 'var(--foreground)' }}>{cond.entity}</strong>
                        {' → '}
                        <span style={{ color: 'var(--accent-purple)' }}>{cond.operator}</span>
                        {cond.value && <span> → <strong style={{ color: 'var(--primary-saffron)' }}>{cond.value}</strong></span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
