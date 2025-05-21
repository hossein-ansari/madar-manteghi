import React, { useState } from 'react'
import './app.css'

interface TruthTableRow {
  inputs: boolean[];
  output: boolean;
  decimal: number;
  gateOutput: boolean;
}

const gateOptions = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
  { label: 'NAND', value: 'NAND' },
  { label: 'NOR', value: 'NOR' },
  { label: 'XOR', value: 'XOR' },
  { label: 'XNOR', value: 'XNOR' },
  { label: 'NOT (first variable only)', value: 'NOT' },
];

function applyGate(gate: string, inputs: boolean[]): boolean {
  switch (gate) {
    case 'AND':
      return inputs.reduce((acc, v) => acc && v, true);
    case 'OR':
      return inputs.reduce((acc, v) => acc || v, false);
    case 'NAND':
      return !inputs.reduce((acc, v) => acc && v, true);
    case 'NOR':
      return !inputs.reduce((acc, v) => acc || v, false);
    case 'XOR':
      return inputs.reduce((acc, v) => acc !== v, false);
    case 'XNOR':
      return !inputs.reduce((acc, v) => acc !== v, false);
    case 'NOT':
      return !inputs[0];
    default:
      return false;
  }
}

function App() {
  const [functionInput, setFunctionInput] = useState<string>('');
  const [truthTable, setTruthTable] = useState<TruthTableRow[]>([]);
  const [error, setError] = useState<string>('');
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedGate, setSelectedGate] = useState<string>('AND');

  const parseFunction = (input: string): { vars: string[], minterms: number[] } | null => {
    const regex = /F=\(([\w,]+)\)=\{([\d,]+)\}/;
    const match = input.match(regex);
    if (!match) {
      setError('فرمت ورودی صحیح نیست. مثال: F=(x,y,z)={1,2,3,5,6,11}');
      return null;
    }
    const vars = match[1].split(',').map(v => v.trim());
    const minterms = match[2].split(',').map(n => parseInt(n.trim()));
    const maxValue = Math.pow(2, vars.length) - 1;
    const invalidMinterms = minterms.filter(m => m < 0 || m > maxValue);
    if (invalidMinterms.length > 0) {
      setError(`مینترم نامعتبر: ${invalidMinterms.join(',')}. باید بین ۰ تا ${maxValue} باشد.`);
      return null;
    }
    return { vars, minterms };
  };

  const generateTruthTable = () => {
    const parsed = parseFunction(functionInput);
    if (!parsed) return;
    const { vars, minterms } = parsed;
    setVariables(vars);
    const numVars = vars.length;
    const rows: TruthTableRow[] = [];
    for (let i = 0; i < Math.pow(2, numVars); i++) {
      const inputs: boolean[] = [];
      for (let j = numVars - 1; j >= 0; j--) {
        inputs.push(Boolean((i >> j) & 1));
      }
      const gateOutput = applyGate(selectedGate, inputs);
      rows.push({
        inputs,
        output: minterms.includes(i),
        decimal: i,
        gateOutput,
      });
    }
    setTruthTable(rows);
    setError('');
  };

  return (
    <div className="container">
      <h1>تولید جدول درستی و مدار منطقی</h1>
      <div className="description">
        <p>تابع بولی را به صورت مینترم وارد کنید. مثال: F=(x,y,z)={'{'}1,2,3,5,6,11{'}'}</p>
        <p>اعداد داخل آکولاد شماره ردیف‌هایی هستند که خروجی تابع ۱ است.</p>
        <p>مثال: F=(x,y,z)={'{'}3,5,6,7{'}'} برای تابع سه متغیره</p>
        <p>گیت مورد نظر را انتخاب کنید تا مدار منطقی آن نمایش داده شود.</p>
      </div>
      <div className="controls">
        <div className="input-group">
          <label>تابع بولی:</label>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => {
              setFunctionInput((e.target as HTMLInputElement).value);
              setError('');
            }}
            placeholder="F=(x,y,z)={1,2,3,5,6,11}"
          />
        </div>
        <div className="input-group">
          <label>انتخاب گیت:</label>
          <select
            value={selectedGate}
            onChange={e => setSelectedGate((e.target as HTMLSelectElement).value)}
          >
            {gateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{
                opt.value === 'AND' ? 'AND (و)' :
                opt.value === 'OR' ? 'OR (یا)' :
                opt.value === 'NAND' ? 'NAND (نند)' :
                opt.value === 'NOR' ? 'NOR (نور)' :
                opt.value === 'XOR' ? 'XOR (یا-انحصاری)' :
                opt.value === 'XNOR' ? 'XNOR (یا-انحصاری معکوس)' :
                opt.value === 'NOT' ? 'NOT (نفی)' : opt.label
              }</option>
            ))}
          </select>
        </div>
        {error && <div className="error">{error.replace('Invalid format. Use format: F=(x,y,z)={1,2,3,5,6,11}', 'فرمت ورودی صحیح نیست. مثال: F=(x,y,z)={1,2,3,5,6,11}')}</div>}
        <button onClick={generateTruthTable}>تولید جدول و مدار</button>
      </div>
      {truthTable.length > 0 && (
        <>
          <div className="truth-table">
            <table>
              <thead>
                <tr>
                  <th>شماره ردیف</th>
                  {variables.map((variable, index) => (
                    <th key={index}>{variable}</th>
                  ))}
                  <th>خروجی (مینترم)</th>
                  <th>خروجی گیت ({
                    selectedGate === 'AND' ? 'و' :
                    selectedGate === 'OR' ? 'یا' :
                    selectedGate === 'NAND' ? 'نند' :
                    selectedGate === 'NOR' ? 'نور' :
                    selectedGate === 'XOR' ? 'یا-انحصاری' :
                    selectedGate === 'XNOR' ? 'یا-انحصاری معکوس' :
                    selectedGate === 'NOT' ? 'نفی' : selectedGate
                  })</th>
                </tr>
              </thead>
              <tbody>
                {truthTable.map((row, rowIndex) => (
                  <tr key={rowIndex} className={row.output ? 'highlighted' : ''}>
                    <td>{row.decimal}</td>
                    {row.inputs.map((value, colIndex) => (
                      <td key={colIndex}>{value ? '۱' : '۰'}</td>
                    ))}
                    <td className={row.output ? 'output' : ''}>{row.output ? '۱' : '۰'}</td>
                    <td className={row.gateOutput ? 'output' : ''}>{row.gateOutput ? '۱' : '۰'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="implemented-circuit">
            <h2>مدار پیاده‌سازی شده</h2>
            {(() => {
              const minterms = truthTable.filter(row => row.output).map(row => row.decimal);
              if (minterms.length === 0) return <p>هیچ مینترمی وجود ندارد (خروجی همیشه صفر است).</p>;
              const sopTerms = minterms.map(m => {
                const bin = m.toString(2).padStart(variables.length, '0');
                return variables.map((v, i) => bin[i] === '1' ? v : v + "'").join('');
              });
              const sopExpr = sopTerms.join(' + ');
              return (
                <>
                  <p><b>فرم SOP (جمع جملات):</b> F = {sopExpr}</p>
                  {selectedGate === 'NAND' && (
                    <p><b>با استفاده از گیت‌های NAND:</b> هر AND با NAND و NOT جایگزین می‌شود، هر OR با ترکیب NANDها و NOTها، و NOT با NAND(x,x).</p>
                  )}
                  {selectedGate === 'NOR' && (
                    <p><b>با استفاده از گیت‌های NOR:</b> هر OR با NOR و NOT جایگزین می‌شود، هر AND با ترکیب NORها و NOTها، و NOT با NOR(x,x).</p>
                  )}
                  {variables.length <= 3 && (
                    <div style={{marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center'}}>
                      <div style={{maxWidth: '100%', overflowX: 'auto'}}>
                        <h3>نمودار مدار منطقی ({selectedGate === 'NAND' ? 'فقط NAND' : selectedGate === 'NOR' ? 'فقط NOR' : 'SOP'})</h3>
                        {selectedGate === 'NAND' ? (
                          <svg width="500" height="220" style={{maxWidth: '100%'}}>
                            {variables.map((v, i) => (
                              <g key={v}>
                                <text x="10" y={40 + i * 40} fontSize="16">{v}</text>
                                <line x1="40" y1={40 + i * 40} x2="80" y2={40 + i * 40} stroke="black" strokeWidth="2" />
                              </g>
                            ))}
                            {sopTerms.map((term, idx) => (
                              <g key={term}>
                                <rect x="100" y={30 + idx * 40} width="40" height="20" fill="#fff" stroke="#000" />
                                <text x="120" y={45 + idx * 40} fontSize="14" textAnchor="middle">NAND</text>
                                {variables.map((v, vi) => (
                                  <line
                                    key={v + idx}
                                    x1="80"
                                    y1={40 + vi * 40}
                                    x2="100"
                                    y2={40 + idx * 40 + 10}
                                    stroke="#888"
                                    strokeWidth="1"
                                  />
                                ))}
                                <rect x="150" y={30 + idx * 40} width="20" height="20" fill="#fff" stroke="#000" />
                                <text x="160" y={45 + idx * 40} fontSize="12" textAnchor="middle">NAND</text>
                                <line x1="140" y1={40 + idx * 40 + 10} x2="150" y2={40 + idx * 40 + 10} stroke="#888" strokeWidth="2" />
                                <line x1="170" y1={40 + idx * 40 + 10} x2="250" y2={110} stroke="#888" strokeWidth="2" />
                              </g>
                            ))}
                            <rect x="250" y="100" width="40" height="20" fill="#fff" stroke="#000" />
                            <text x="270" y="115" fontSize="14" textAnchor="middle">NAND</text>
                            <rect x="300" y="100" width="20" height="20" fill="#fff" stroke="#000" />
                            <text x="310" y="115" fontSize="12" textAnchor="middle">NAND</text>
                            <line x1="320" y1="110" x2="400" y2="110" stroke="#000" strokeWidth="2" />
                            <text x="410" y="115" fontSize="16">F</text>
                          </svg>
                        ) : selectedGate === 'NOR' ? (
                          <svg width="500" height="220" style={{maxWidth: '100%'}}>
                            {variables.map((v, i) => (
                              <g key={v}>
                                <text x="10" y={40 + i * 40} fontSize="16">{v}</text>
                                <line x1="40" y1={40 + i * 40} x2="80" y2={40 + i * 40} stroke="black" strokeWidth="2" />
                              </g>
                            ))}
                            {sopTerms.map((term, idx) => (
                              <g key={term}>
                                <rect x="100" y={30 + idx * 40} width="40" height="20" fill="#fff" stroke="#000" />
                                <text x="120" y={45 + idx * 40} fontSize="14" textAnchor="middle">NOR</text>
                                {variables.map((v, vi) => (
                                  <line
                                    key={v + idx}
                                    x1="80"
                                    y1={40 + vi * 40}
                                    x2="100"
                                    y2={40 + idx * 40 + 10}
                                    stroke="#888"
                                    strokeWidth="1"
                                  />
                                ))}
                                <rect x="150" y={30 + idx * 40} width="20" height="20" fill="#fff" stroke="#000" />
                                <text x="160" y={45 + idx * 40} fontSize="12" textAnchor="middle">NOR</text>
                                <line x1="140" y1={40 + idx * 40 + 10} x2="150" y2={40 + idx * 40 + 10} stroke="#888" strokeWidth="2" />
                                <line x1="170" y1={40 + idx * 40 + 10} x2="250" y2={110} stroke="#888" strokeWidth="2" />
                              </g>
                            ))}
                            <rect x="250" y="100" width="40" height="20" fill="#fff" stroke="#000" />
                            <text x="270" y="115" fontSize="14" textAnchor="middle">NOR</text>
                            <rect x="300" y="100" width="20" height="20" fill="#fff" stroke="#000" />
                            <text x="310" y="115" fontSize="12" textAnchor="middle">NOR</text>
                            <line x1="320" y1="110" x2="400" y2="110" stroke="#000" strokeWidth="2" />
                            <text x="410" y="115" fontSize="16">F</text>
                          </svg>
                        ) : (
                          <svg width="400" height="200" style={{maxWidth: '100%'}}>
                            {variables.map((v, i) => (
                              <g key={v}>
                                <text x="10" y={40 + i * 40} fontSize="16">{v}</text>
                                <line x1="40" y1={40 + i * 40} x2="80" y2={40 + i * 40} stroke="black" strokeWidth="2" />
                              </g>
                            ))}
                            {sopTerms.map((term, idx) => (
                              <g key={term}>
                                <rect x="100" y={30 + idx * 40} width="40" height="20" fill="#fff" stroke="#000" />
                                <text x="120" y={45 + idx * 40} fontSize="14" textAnchor="middle">AND</text>
                                {variables.map((v, vi) => (
                                  <line
                                    key={v + idx}
                                    x1="80"
                                    y1={40 + vi * 40}
                                    x2="100"
                                    y2={40 + idx * 40 + 10}
                                    stroke="#888"
                                    strokeWidth="1"
                                  />
                                ))}
                                <line x1="140" y1={40 + idx * 40 + 10} x2="200" y2={100} stroke="#888" strokeWidth="2" />
                              </g>
                            ))}
                            <rect x="200" y="90" width="40" height="20" fill="#fff" stroke="#000" />
                            <text x="220" y="105" fontSize="14" textAnchor="middle">OR</text>
                            <line x1="240" y1="100" x2="300" y2="100" stroke="#000" strokeWidth="2" />
                            <text x="310" y="105" fontSize="16">F</text>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  )
}

export default App
