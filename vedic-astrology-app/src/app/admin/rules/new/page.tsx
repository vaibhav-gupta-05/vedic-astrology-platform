'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RuleConditionRow from '@/components/RuleConditionRow';

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
    <div className="fade-in" style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.2rem', fontSize: '1.6rem' }}>
          <span style={{ marginRight: '0.4rem', opacity: 0.5 }}>✦</span>
          Construct Planetary Rule
        </h1>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.88rem' }}>Define the conditions for a new Yoga or Dosha</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel-static" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Section 1: Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '-0.4rem' }}>
          <span className="badge badge-gold">Step 1</span>
          <span className="text-muted" style={{ fontSize: '0.82rem' }}>Identity</span>
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

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

        {/* Section 2: Conditions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge badge-purple">Step 2</span>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Conditions</span>
            </div>
            <select
              className="input-field"
              value={logic}
              onChange={e => setLogic(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 2rem 0.35rem 0.7rem', fontSize: '0.82rem' }}
            >
              <option value="AND">Match ALL (AND)</option>
              <option value="OR">Match ANY (OR)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {conditions.map((cond, i) => (
              <RuleConditionRow
                key={i}
                index={i}
                entity={cond.entity}
                operator={cond.operator}
                value={cond.value}
                onChange={updateCondition}
                onRemove={removeCondition}
              />
            ))}
          </div>

          <button type="button" onClick={addCondition} className="btn-outline" style={{ marginTop: '0.6rem', width: '100%', borderStyle: 'dashed' }}>
            + Add Condition
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '0.75rem', padding: '0.9rem' }}>
          Save Combination
        </button>
      </form>
    </div>
  );
}
