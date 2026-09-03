'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRulePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logic, setLogic] = useState('AND');
  const [conditions, setConditions] = useState([{ entity: 'Jupiter', operator: 'IN_HOUSE', value: '' }]);

  const addCondition = () => {
    setConditions([...conditions, { entity: 'Jupiter', operator: 'IN_HOUSE', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, val: string) => {
    const newConditions = [...conditions];
    (newConditions[index] as any)[field] = val;
    setConditions(newConditions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, logic, conditions }),
      });

      if (!res.ok) throw new Error('Failed to save rule');

      alert('Rule saved successfully!');
      router.push('/admin');
    } catch (err) {
      console.error(err);
      alert('Error saving rule. Check console.');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem', fontSize: '1.8rem' }}>
          <span style={{ marginRight: '0.5rem', opacity: 0.5 }}>✦</span>
          Construct Planetary Rule
        </h1>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Define the conditions for a new Yoga or Dosha</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel-static" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Section 1: Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '-0.5rem' }}>
          <span className="badge badge-gold">Step 1</span>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Identity</span>
        </div>

        <div>
          <label className="input-label">Yoga / Dosha Name</label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Gaja Kesari Yoga"
          />
        </div>

        <div>
          <label className="input-label">Interpretation</label>
          <textarea
            className="input-field"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="The resulting output if this rule matches..."
            rows={4}
          />
        </div>

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

        {/* Section 2: Conditions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-purple">Step 2</span>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Conditions</span>
            </div>
            <select
              className="input-field"
              value={logic}
              onChange={e => setLogic(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="AND">Match ALL (AND)</option>
              <option value="OR">Match ANY (OR)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {conditions.map((cond, i) => (
              <div key={i} className="condition-row">
                <select
                  className="input-field"
                  value={cond.entity}
                  onChange={e => updateCondition(i, 'entity', e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="Sun">Sun / Surya (सूर्य)</option>
                  <option value="Moon">Moon / Chandra (चंद्र)</option>
                  <option value="Mars">Mars / Mangal (मंगल)</option>
                  <option value="Mercury">Mercury / Budh (बुध)</option>
                  <option value="Jupiter">Jupiter / Guru (गुरु)</option>
                  <option value="Venus">Venus / Shukra (शुक्र)</option>
                  <option value="Saturn">Saturn / Shani (शनि)</option>
                  <option value="Rahu">Rahu (राहु)</option>
                  <option value="Ketu">Ketu (केतु)</option>
                </select>

                <select
                  className="input-field"
                  value={cond.operator}
                  onChange={e => updateCondition(i, 'operator', e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="IN_HOUSE">In House / भाव में</option>
                  <option value="IN_SIGN">In Sign / राशि में</option>
                  <option value="CONJUNCT">Conjunct / युति</option>
                  <option value="ASPECTS">Aspects / दृष्टि</option>
                  <option value="EXALTED">Exalted / उच्च</option>
                  <option value="DEBILITATED">Debilitated / नीच</option>
                </select>

                <input
                  type="text"
                  className="input-field"
                  value={cond.value}
                  onChange={e => updateCondition(i, 'value', e.target.value)}
                  placeholder="Value..."
                  style={{ flex: 1 }}
                  title="House number (1-12), KENDRA, TRIKONA, or Planet/Sign name"
                />

                <button type="button" onClick={() => removeCondition(i)} className="btn-danger" style={{ flexShrink: 0, padding: '0.6rem 0.8rem' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addCondition} className="btn-outline" style={{ marginTop: '0.75rem', width: '100%', borderStyle: 'dashed' }}>
            + Add Condition
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
          Save Combination
        </button>
      </form>
    </div>
  );
}
