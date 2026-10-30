'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const duplicateRule = async (rule: any) => {
    setActionLoading(rule.id);
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${rule.name} (Copy)`,
          description: rule.description,
          logic: rule.logic || 'AND',
          conditions: (rule.conditions || []).map((c: any) => ({
            entity: c.entity,
            operator: c.operator,
            value: c.value
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Insert at the very top since it is newest!
        setRules([data.rule, ...rules]);
      } else {
        alert('Failed to duplicate rule.');
      }
    } catch (err) {
      console.error('Failed to duplicate rule:', err);
      alert('Error duplicating rule.');
    } finally {
      setActionLoading(null);
    }
  };

  const editRule = (id: string) => {
    router.push(`/admin/rules/${id}/edit`);
  };

  // Strictly case-insensitive search across name, description, entities, operators, and values
  const filteredRules = rules.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // Tokenize terms so searches like "JUPITER 9" or "rahu lagna" match across fields case-insensitively
    const terms = q.split(/\s+/).filter(Boolean);

    return terms.every(term => {
      const nameMatch = (r.name || '').toLowerCase().includes(term);
      const descMatch = (r.description || '').toLowerCase().includes(term);
      const condMatch = (r.conditions || []).some((c: any) =>
        String(c.entity || '').toLowerCase().includes(term) ||
        String(c.operator || '').toLowerCase().includes(term) ||
        String(c.value || '').toLowerCase().includes(term)
      );

      return nameMatch || descMatch || condMatch;
    });
  });

  const totalConditions = rules.reduce((acc, r) => acc + (r.conditions?.length || 0), 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem', fontSize: '1.6rem' }}>Rule Management</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.88rem' }}>Create and manage Pandit Ji&apos;s astrological combinations library</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link href="/admin/rules/new">
            <button className="btn-primary" style={{ padding: '0.6rem 1.1rem' }}>✦ Create New Rule</button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div className="stat-card fade-in-up stagger-1">
          <div className="stat-value">{loading ? '–' : rules.length}</div>
          <div className="stat-label">Active Rules</div>
        </div>
        <div className="stat-card fade-in-up stagger-2">
          <div className="stat-value">{loading ? '–' : totalConditions}</div>
          <div className="stat-label">Total Conditions</div>
        </div>
        <div className="stat-card fade-in-up stagger-3">
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>●</div>
          <div className="stat-label">Engine Active (Render)</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {rules.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search combinations by planet, yoga name, or interpretation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '0.85rem', fontSize: '0.85rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground-muted)'
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
              Showing {filteredRules.length} of {rules.length}
            </span>
          )}
        </div>
      )}

      {/* Rules List */}
      <div className="glass-panel-static fade-in-up stagger-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--primary-saffron)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <span style={{ opacity: 0.5 }}>📜</span> Active Combinations ({filteredRules.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
            ✦ Sorted: <b>Latest First</b>
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '2rem 0' }}>
            <div className="cosmic-spinner-sm" style={{ color: 'var(--primary-saffron)' }} />
            <span className="text-muted">Loading rules from Neon database...</span>
          </div>
        ) : filteredRules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '0.75rem' }}>☉</div>
            <p className="text-muted" style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>
              {searchQuery ? 'No combinations match your search query.' : 'No active combinations in the database.'}
            </p>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="btn-outline">Clear Search</button>
            ) : (
              <Link href="/admin/rules/new">
                <button className="btn-outline">Create Your First Rule</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredRules.map((rule, idx) => (
              <div key={rule.id} className={`rule-card fade-in-up stagger-${Math.min(idx + 1, 9)}`}>
                {/* Rule Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{rule.name}</h4>
                    <span className={`badge ${rule.logic === 'OR' ? 'badge-rose' : 'badge-purple'}`}>{rule.logic || 'AND'}</span>
                    {idx === 0 && !searchQuery && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>★ Latest</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => duplicateRule(rule)}
                      className="btn-ghost"
                      disabled={actionLoading === rule.id}
                      title="Duplicate this combination as a starting template"
                      style={{ fontSize: '0.8rem' }}
                    >
                      {actionLoading === rule.id ? '...' : '⎘ Duplicate'}
                    </button>
                    <button onClick={() => editRule(rule.id)} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                      ✎ Edit
                    </button>
                    <button onClick={() => removeRule(rule.id)} className="btn-danger" style={{ fontSize: '0.8rem' }}>
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
