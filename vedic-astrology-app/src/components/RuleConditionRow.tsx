'use client';
import React from 'react';

export type AstroSection = 
  | 'LAGNA_D1' 
  | 'GRAH_STHITI' 
  | 'ASHTAKAVARGA' 
  | 'KARKAMSHA' 
  | 'NAVAMSHA_D9' 
  | 'BHAVA_CHALIT' 
  | 'PANCHANG';

export interface SectionMeta {
  id: AstroSection;
  label: string;
  hindi: string;
  icon: string;
  color: string;
  defaultOperator: string;
  defaultEntity: string;
  defaultVal: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: 'LAGNA_D1',      label: 'Lagna Chart (D1)',      hindi: 'लग्न कुंडली',       icon: '🪐', color: 'var(--accent-purple)',  defaultOperator: 'IN_HOUSE',          defaultEntity: 'Jupiter', defaultVal: '1' },
  { id: 'GRAH_STHITI',   label: 'Grah Sthiti & Nakshatra', hindi: 'ग्रह स्थिति / नक्षत्र', icon: '⭐', color: 'var(--accent-emerald)', defaultOperator: 'IN_NAKSHATRA',      defaultEntity: 'Moon',    defaultVal: 'Rohini' },
  { id: 'ASHTAKAVARGA',  label: 'Ashtakavarga (BAV/SAV)', hindi: 'अष्टकवर्ग (बिन्दु)', icon: '📊', color: 'var(--primary-saffron)', defaultOperator: 'BAV_SCORE_GTE',     defaultEntity: 'Sun',     defaultVal: '4' },
  { id: 'KARKAMSHA',     label: 'Jaimini Karkamsha',     hindi: 'जैमिनी कारकांश',     icon: '🔮', color: 'var(--accent-rose)',    defaultOperator: 'IS_ATMAKARAKA',     defaultEntity: 'Sun',     defaultVal: '' },
  { id: 'NAVAMSHA_D9',   label: 'Navamsha Chart (D9)',   hindi: 'नवांश कुंडली',       icon: '☸️', color: '#38bdf8',               defaultOperator: 'NAVAMSHA_IN_SIGN',  defaultEntity: 'Venus',   defaultVal: 'Pisces' },
  { id: 'BHAVA_CHALIT',  label: 'Bhava Chalit Chart',    hindi: 'भाव चलित कुंडली',    icon: '🏛️', color: '#fb923c',               defaultOperator: 'CHALIT_IN_HOUSE',   defaultEntity: 'Jupiter', defaultVal: '1' },
  { id: 'PANCHANG',      label: 'Panchang (Birth Day)',  hindi: 'पंचांग',             icon: '📜', color: '#a78bfa',               defaultOperator: 'VAAR_IS',           defaultEntity: 'Panchang',defaultVal: 'Tuesday' },
];

const CLASSIC_PLANETS = [
  { value: 'Sun',     label: 'Sun / Surya (सूर्य)' },
  { value: 'Moon',    label: 'Moon / Chandra (चंद्र)' },
  { value: 'Mars',    label: 'Mars / Mangal (मंगल)' },
  { value: 'Mercury', label: 'Mercury / Budh (बुध)' },
  { value: 'Jupiter', label: 'Jupiter / Guru (गुरु)' },
  { value: 'Venus',   label: 'Venus / Shukra (शुक्र)' },
  { value: 'Saturn',  label: 'Saturn / Shani (शनि)' },
  { value: 'Rahu',    label: 'Rahu (राहु)' },
  { value: 'Ketu',    label: 'Ketu (केतु)' },
];

// 7 planets for Ashtakavarga & Jaimini Karakas (no Rahu/Ketu)
const JAIMINI_PLANETS = [
  { value: 'Sun',     label: 'Sun / Surya (सूर्य)' },
  { value: 'Moon',    label: 'Moon / Chandra (चंद्र)' },
  { value: 'Mars',    label: 'Mars / Mangal (मंगल)' },
  { value: 'Mercury', label: 'Mercury / Budh (बुध)' },
  { value: 'Jupiter', label: 'Jupiter / Guru (गुरु)' },
  { value: 'Venus',   label: 'Venus / Shukra (शुक्र)' },
  { value: 'Saturn',  label: 'Saturn / Shani (शनि)' },
];

export const OPERATORS_BY_SECTION: Record<AstroSection, { value: string; label: string }[]> = {
  LAGNA_D1: [
    { value: 'IN_HOUSE',    label: 'In House / भाव में' },
    { value: 'IN_SIGN',     label: 'In Sign / राशि में' },
    { value: 'CONJUNCT',    label: 'Conjunct / युति (With Planet)' },
    { value: 'ASPECTS',     label: 'Aspects / दृष्टि (On Planet)' },
    { value: 'EXALTED',     label: 'Exalted / उच्च का' },
    { value: 'DEBILITATED', label: 'Debilitated / नीच का' },
  ],
  GRAH_STHITI: [
    { value: 'IN_NAKSHATRA',      label: 'In Nakshatra / नक्षत्र में' },
    { value: 'NAKSHATRA_LORD_IS', label: 'Nakshatra Lord is / नक्षत्र स्वामी' },
  ],
  ASHTAKAVARGA: [
    { value: 'BAV_SCORE_GTE', label: 'BAV Score ≥ (Bindus in natal sign)' },
    { value: 'BAV_SCORE_LTE', label: 'BAV Score ≤ (Bindus in natal sign)' },
    { value: 'SAV_SCORE_GTE', label: 'SAV Score ≥ (Total bindus in sign)' },
  ],
  KARKAMSHA: [
    { value: 'IS_ATMAKARAKA',     label: 'Is Atmakaraka (AK) / आत्मकारक' },
    { value: 'IS_KARAKA',         label: 'Is Chara Karaka Role (AK/AmK/BK...)' },
    { value: 'KARKAMSHA_IN_SIGN', label: 'Karkamsha Lagna is in Sign' },
  ],
  NAVAMSHA_D9: [
    { value: 'NAVAMSHA_IN_SIGN',  label: 'In Navamsha Sign / नवांश राशि में' },
    { value: 'NAVAMSHA_IN_HOUSE', label: 'In Navamsha House / नवांश भाव में' },
  ],
  BHAVA_CHALIT: [
    { value: 'CHALIT_IN_HOUSE',   label: 'In Chalit House / चलित भाव में' },
  ],
  PANCHANG: [
    { value: 'VAAR_IS',           label: 'Vaar (Birth Day) is / वार' },
    { value: 'TITHI_IS',          label: 'Tithi is / तिथि' },
  ],
};

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const KARAKA_ROLES = [
  { value: 'AK',  label: 'AK – Atmakaraka (आत्मकारक)' },
  { value: 'AmK', label: 'AmK – Amatyakaraka (अमात्यकारक)' },
  { value: 'BK',  label: 'BK – Bhratrukaraka (भ्रातृकारक)' },
  { value: 'MK',  label: 'MK – Matrukaraka (मातृकारक)' },
  { value: 'PK',  label: 'PK – Putrakaraka (पुत्रकारक)' },
  { value: 'GK',  label: 'GK – Gnatikaraka (ज्ञातिरक)' },
  { value: 'DK',  label: 'DK – Darakaraka (दाराकारक)' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to determine the section from an operator string
export function getSectionFromOperator(op: string): AstroSection {
  for (const [secKey, opList] of Object.entries(OPERATORS_BY_SECTION)) {
    if (opList.some(o => o.value === op)) {
      return secKey as AstroSection;
    }
  }
  return 'LAGNA_D1';
}

interface ConditionRowProps {
  index: number;
  entity: string;
  operator: string;
  value: string;
  onChange: (index: number, field: string, val: string) => void;
  onRemove: (index: number) => void;
}

export default function RuleConditionRow({
  index,
  entity,
  operator,
  value,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const currentSection = getSectionFromOperator(operator);
  const sectionMeta = SECTIONS.find(s => s.id === currentSection) || SECTIONS[0];
  const operators = OPERATORS_BY_SECTION[currentSection] || OPERATORS_BY_SECTION.LAGNA_D1;

  // Handle section change
  const handleSectionChange = (newSecId: AstroSection) => {
    const newSec = SECTIONS.find(s => s.id === newSecId) || SECTIONS[0];
    onChange(index, 'operator', newSec.defaultOperator);
    onChange(index, 'entity', newSec.defaultEntity);
    onChange(index, 'value', newSec.defaultVal);
  };

  // Handle operator change
  const handleOperatorChange = (newOp: string) => {
    onChange(index, 'operator', newOp);
    // Smart reset of default value when switching operator
    if (newOp === 'IN_HOUSE' || newOp === 'NAVAMSHA_IN_HOUSE' || newOp === 'CHALIT_IN_HOUSE') {
      onChange(index, 'value', '1');
    } else if (newOp === 'IN_SIGN' || newOp === 'NAVAMSHA_IN_SIGN' || newOp === 'KARKAMSHA_IN_SIGN') {
      onChange(index, 'value', 'Aries');
    } else if (newOp === 'IN_NAKSHATRA') {
      onChange(index, 'value', 'Ashwini');
    } else if (newOp === 'CONJUNCT' || newOp === 'ASPECTS' || newOp === 'NAKSHATRA_LORD_IS') {
      onChange(index, 'value', 'Jupiter');
    } else if (newOp.includes('SCORE')) {
      onChange(index, 'value', '4');
    } else if (newOp === 'IS_KARAKA') {
      onChange(index, 'value', 'AK');
    } else if (newOp === 'EXALTED' || newOp === 'DEBILITATED' || newOp === 'IS_ATMAKARAKA') {
      onChange(index, 'value', '');
    }
  };

  // Decide which planet list to show
  const isJaiminiOrAshtak = currentSection === 'ASHTAKAVARGA' || currentSection === 'KARKAMSHA';
  const planetList = isJaiminiOrAshtak ? JAIMINI_PLANETS : CLASSIC_PLANETS;
  const isPanchang = currentSection === 'PANCHANG';
  const isKarkamshaSign = operator === 'KARKAMSHA_IN_SIGN';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        padding: '0.9rem',
        background: 'var(--background)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `4px solid ${sectionMeta.color}`,
        border: `1px solid color-mix(in srgb, ${sectionMeta.color} 30%, transparent)`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Bar: Section Selector & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Section:
          </span>
          <select
            className="input-field"
            value={currentSection}
            onChange={e => handleSectionChange(e.target.value as AstroSection)}
            style={{
              padding: '0.3rem 1.8rem 0.3rem 0.65rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: sectionMeta.color,
              borderColor: `color-mix(in srgb, ${sectionMeta.color} 50%, transparent)`,
              background: 'var(--background-card, var(--background))',
              cursor: 'pointer',
            }}
          >
            {SECTIONS.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.icon} {sec.label} — {sec.hindi}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="btn-danger"
          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
          title="Remove this condition"
        >
          ✕ Remove
        </button>
      </div>

      {/* Inputs Grid */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Field 1: Entity */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--foreground-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isPanchang ? 'Attribute' : 'Planet / ग्रह'}
          </label>
          {isPanchang ? (
            <input
              type="text"
              className="input-field"
              value="Panchang"
              disabled
              style={{ opacity: 0.8, cursor: 'not-allowed' }}
            />
          ) : isKarkamshaSign ? (
            <input
              type="text"
              className="input-field"
              value="Chart Karkamsha"
              disabled
              style={{ opacity: 0.8, cursor: 'not-allowed' }}
            />
          ) : (
            <select
              className="input-field"
              value={entity}
              onChange={e => onChange(index, 'entity', e.target.value)}
            >
              {planetList.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Field 2: Operator */}
        <div style={{ flex: '1.4 1 230px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--foreground-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Condition / शर्त
          </label>
          <select
            className="input-field"
            value={operator}
            onChange={e => handleOperatorChange(e.target.value)}
          >
            {operators.map(op => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 3: Value */}
        <div style={{ flex: '1.2 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--foreground-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Value / मान
          </label>
          {renderValueField(operator, value, v => onChange(index, 'value', v))}
        </div>
      </div>
    </div>
  );
}

function renderValueField(operator: string, value: string, onChange: (v: string) => void) {
  const inputCls = 'input-field';

  // No value needed operators
  if (operator === 'EXALTED' || operator === 'DEBILITATED' || operator === 'IS_ATMAKARAKA') {
    return (
      <div
        style={{
          padding: '0.55rem 0.75rem',
          fontSize: '0.8rem',
          color: 'var(--foreground-muted)',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-color)',
        }}
      >
        ✓ Automatic evaluation
      </div>
    );
  }

  // House selector
  if (operator === 'IN_HOUSE' || operator === 'NAVAMSHA_IN_HOUSE' || operator === 'CHALIT_IN_HOUSE') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select House —</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={String(i + 1)}>
            House {i + 1} ({i + 1} भाव)
          </option>
        ))}
        <option value="KENDRA">KENDRA / केंद्र (1, 4, 7, 10)</option>
        <option value="TRIKONA">TRIKONA / त्रिकोण (1, 5, 9)</option>
      </select>
    );
  }

  // Sign selector
  if (operator === 'IN_SIGN' || operator === 'NAVAMSHA_IN_SIGN' || operator === 'KARKAMSHA_IN_SIGN') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select Sign —</option>
        {ZODIAC_SIGNS.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    );
  }

  // Planet selector (Conjunct / Aspects / Nakshatra Lord)
  if (operator === 'CONJUNCT' || operator === 'ASPECTS' || operator === 'NAKSHATRA_LORD_IS') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select Planet —</option>
        {CLASSIC_PLANETS.map(p => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    );
  }

  // Nakshatra selector
  if (operator === 'IN_NAKSHATRA') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select Nakshatra —</option>
        {NAKSHATRAS.map((n, idx) => (
          <option key={n} value={n}>
            {idx + 1}. {n}
          </option>
        ))}
      </select>
    );
  }

  // Ashtakavarga Bindus
  if (operator === 'BAV_SCORE_GTE' || operator === 'BAV_SCORE_LTE') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Bindu Threshold —</option>
        {Array.from({ length: 9 }, (_, i) => (
          <option key={i} value={String(i)}>
            {i} bindus {i >= 4 ? '(Auspicious / शुभ)' : '(Weak / कमजोर)'}
          </option>
        ))}
      </select>
    );
  }

  if (operator === 'SAV_SCORE_GTE') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— SAV Threshold —</option>
        {[20, 24, 28, 30, 32, 36].map(b => (
          <option key={b} value={String(b)}>
            ≥ {b} bindus {b >= 28 ? '(Above Average)' : '(Below Average)'}
          </option>
        ))}
      </select>
    );
  }

  // Karaka Role
  if (operator === 'IS_KARAKA') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Karaka Role —</option>
        {KARAKA_ROLES.map(k => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
    );
  }

  // Panchang Day (Vaar)
  if (operator === 'VAAR_IS') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select Day —</option>
        {DAYS_OF_WEEK.map(d => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    );
  }

  // Panchang Tithi
  if (operator === 'TITHI_IS') {
    return (
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select Tithi —</option>
        <option value="15">Purnima (15 / पूर्णिमा)</option>
        <option value="30">Amavasya (30 / अमावस्या)</option>
        {Array.from({ length: 30 }, (_, i) => (
          <option key={i + 1} value={String(i + 1)}>
            Tithi {i + 1}
          </option>
        ))}
      </select>
    );
  }

  // Fallback text
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Value..."
    />
  );
}


