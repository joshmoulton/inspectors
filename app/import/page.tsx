'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Papa from 'papaparse';
import {
  Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle,
  Info, Loader2, Ban, BarChart3
} from 'lucide-react';

const BATCH_SIZE = 100;

interface ImportStats {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  errors: { row: number; id: string; message: string }[];
}

type ImportPhase = 'idle' | 'counting' | 'importing' | 'finalizing' | 'done' | 'cancelled' | 'error';

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [stats, setStats] = useState<ImportStats>({
    total: 0, processed: 0, inserted: 0, updated: 0, errors: [],
  });
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);
  const router = useRouter();

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      resetState();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      resetState();
    }
  }

  function resetState() {
    setPhase('idle');
    setStats({ total: 0, processed: 0, inserted: 0, updated: 0, errors: [] });
    setErrorMessage('');
    cancelledRef.current = false;
  }

  function handleCancel() {
    cancelledRef.current = true;
    setPhase('cancelled');
  }

  async function sendBatch(rows: Record<string, string>[], batchIndex: number) {
    const res = await fetch('/api/import/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, batchIndex }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Batch ${batchIndex} failed with status ${res.status}`);
    }

    return res.json() as Promise<{
      inserted: number;
      updated: number;
      errors: { row: number; id: string; message: string }[];
    }>;
  }

  async function handleImport() {
    if (!file || phase === 'importing') return;

    cancelledRef.current = false;
    setPhase('counting');
    setStats({ total: 0, processed: 0, inserted: 0, updated: 0, errors: [] });
    setErrorMessage('');

    // Phase 1: Parse entire CSV into an array
    // Papa Parse handles this efficiently even for large files
    const allRows = await new Promise<Record<string, string>[]>((resolve, reject) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err: Error) => reject(err),
      });
    });

    if (allRows.length === 0) {
      setPhase('error');
      setErrorMessage('CSV file is empty or has no valid rows.');
      return;
    }

    setStats(prev => ({ ...prev, total: allRows.length }));
    setPhase('importing');

    // Phase 2: Process in sequential batches
    let totalInserted = 0;
    let totalUpdated = 0;
    const allErrors: { row: number; id: string; message: string }[] = [];

    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
      if (cancelledRef.current) break;

      const batch = allRows.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE);

      try {
        const result = await sendBatch(batch, batchIndex);
        totalInserted += result.inserted;
        totalUpdated += result.updated;
        allErrors.push(...result.errors);

        setStats({
          total: allRows.length,
          processed: Math.min(i + BATCH_SIZE, allRows.length),
          inserted: totalInserted,
          updated: totalUpdated,
          errors: [...allErrors],
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Batch failed';
        allErrors.push({ row: i, id: 'batch', message: msg });

        setStats({
          total: allRows.length,
          processed: Math.min(i + BATCH_SIZE, allRows.length),
          inserted: totalInserted,
          updated: totalUpdated,
          errors: [...allErrors],
        });
      }
    }

    if (cancelledRef.current) return;

    // Phase 3: Finalize
    setPhase('finalizing');
    try {
      await fetch('/api/import/finalize', { method: 'POST' });
    } catch {
      // Non-critical
    }

    setPhase('done');
    toast.success(`Import complete: ${totalInserted + totalUpdated} orders processed`);
    router.refresh();
  }

  const pct = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;
  const isActive = phase === 'importing' || phase === 'counting' || phase === 'finalizing';

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Import Data</h1>
          <p className="page-subtitle">Batch import work orders from Inspectorade CSV exports.</p>
        </div>
      </header>

      <div className="grid-sidebar-right">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Drop Zone */}
          <div
            className="card photo-drop-zone"
            style={{
              border: isDragging ? '2px dashed var(--brand-primary-light)' : '2px dashed var(--border-subtle)',
              background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)',
              transition: 'all 0.2s',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(99, 102, 241, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'var(--brand-primary-light)',
            }}>
              <Upload size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload CSV File</h3>
            <p style={{
              fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24,
              maxWidth: 360, margin: '0 auto 24px',
            }}>
              Drag and drop your Inspectorade CSV export here. Files up to 100MB are supported via streaming.
            </p>

            <input
              type="file"
              id="csv-input"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".csv,text/csv"
              disabled={isActive}
            />
            <label
              htmlFor="csv-input"
              className="btn btn-primary"
              style={{
                cursor: isActive ? 'not-allowed' : 'pointer',
                opacity: isActive ? 0.5 : 1,
              }}
            >
              <FileSpreadsheet size={16} /> Select File
            </label>

            {/* File info */}
            {file && (
              <div style={{
                marginTop: 24, padding: '12px 16px',
                background: 'rgba(99, 102, 241, 0.06)', border: '1px solid var(--border-subtle)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--brand-primary-light)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {file.size > 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(file.size / 1024).toFixed(1)} KB`}
                    </div>
                  </div>
                </div>
                {!isActive && (
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setFile(null);
                      resetState();
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            {file && phase === 'idle' && (
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleImport}>
                  Start Import
                </button>
              </div>
            )}

            {isActive && (
              <div style={{ marginTop: 16 }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={handleCancel}
                >
                  <Ban size={14} /> Cancel Import
                </button>
              </div>
            )}
          </div>

          {/* Progress Card */}
          {(isActive || phase === 'done' || phase === 'cancelled' || phase === 'error') && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                {phase === 'done' ? (
                  <CheckCircle size={20} style={{ color: 'var(--status-success)' }} />
                ) : phase === 'error' || phase === 'cancelled' ? (
                  <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />
                ) : (
                  <Loader2 size={20} className="spin" style={{ color: 'var(--brand-primary-light)' }} />
                )}
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                  {phase === 'counting' && 'Analyzing CSV...'}
                  {phase === 'importing' && 'Importing Orders...'}
                  {phase === 'finalizing' && 'Finalizing...'}
                  {phase === 'done' && 'Import Complete'}
                  {phase === 'cancelled' && 'Import Cancelled'}
                  {phase === 'error' && 'Import Failed'}
                </h3>
              </div>

              {/* Progress bar */}
              {stats.total > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6,
                  }}>
                    <span>{stats.processed.toLocaleString()} / {stats.total.toLocaleString()} rows</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{
                    width: '100%', height: 8, borderRadius: 4,
                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 4,
                      background: phase === 'done'
                        ? 'var(--status-success)'
                        : phase === 'cancelled'
                          ? 'var(--status-warning)'
                          : 'var(--brand-primary-light)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Stats grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
                marginBottom: stats.errors.length > 0 ? 20 : 0,
              }}>
                <div style={{
                  padding: '12px 8px', borderRadius: 8, textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--status-success)' }}>
                    {stats.inserted.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Inserted</div>
                </div>
                <div style={{
                  padding: '12px 8px', borderRadius: 8, textAlign: 'center',
                  background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-primary-light)' }}>
                    {stats.updated.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Updated</div>
                </div>
                <div style={{
                  padding: '12px 8px', borderRadius: 8, textAlign: 'center',
                  background: stats.errors.length > 0
                    ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-tertiary)',
                  border: stats.errors.length > 0
                    ? '1px solid rgba(239, 68, 68, 0.12)' : '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    fontSize: 20, fontWeight: 700,
                    color: stats.errors.length > 0 ? 'var(--status-danger)' : 'var(--text-tertiary)',
                  }}>
                    {stats.errors.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Errors</div>
                </div>
              </div>

              {/* Error log */}
              {stats.errors.length > 0 && (
                <div style={{
                  maxHeight: 200, overflowY: 'auto', borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  background: 'rgba(239, 68, 68, 0.03)',
                }}>
                  {stats.errors.slice(0, 50).map((err, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px', fontSize: 11, fontFamily: 'monospace',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.08)',
                        display: 'flex', gap: 8,
                      }}
                    >
                      <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        Row {err.row}
                      </span>
                      <span style={{ color: 'var(--status-danger)' }}>{err.id}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{err.message}</span>
                    </div>
                  ))}
                  {stats.errors.length > 50 && (
                    <div style={{
                      padding: '8px 12px', fontSize: 11, color: 'var(--text-tertiary)',
                      textAlign: 'center',
                    }}>
                      ...and {stats.errors.length - 50} more errors
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div style={{
                  padding: 12, borderRadius: 8, fontSize: 13,
                  background: 'rgba(239, 68, 68, 0.08)', color: 'var(--status-danger)',
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Done actions */}
              {phase === 'done' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => router.push('/orders')}
                  >
                    <BarChart3 size={14} /> View Orders
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setFile(null);
                      resetState();
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Import Another
                  </button>
                </div>
              )}

              {phase === 'cancelled' && (
                <div style={{ marginTop: 16 }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleImport}
                  >
                    Restart Import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CSV Format Guide */}
        <div className="card" style={{ padding: 24, alignSelf: 'flex-start' }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Info size={16} /> Inspectorade CSV Format
          </h3>
          <p style={{
            fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5,
          }}>
            Export your data from Inspectorade as CSV. The following columns are automatically mapped:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { col: 'ID', desc: 'Used as order number (unique identifier).' },
              { col: 'Address, City, State, Zip', desc: 'Property address fields.' },
              { col: 'Client', desc: 'Matched by name. Auto-created if new.' },
              { col: 'Inspector', desc: 'Matched by first + last name.' },
              { col: 'Status', desc: 'Mapped to system statuses (Open, Paid, etc.).' },
              { col: 'WorkCode', desc: 'Inspection type (e.g., Exterior Occupancy).' },
              { col: 'InspectorPay', desc: 'Numeric pay amount.' },
              { col: 'Dates', desc: 'Ordered, Assigned, Completed, Submitted, Paid.' },
              { col: 'Instructions', desc: 'Full instruction text carried over.' },
              { col: 'Lat/Long', desc: 'GPS coordinates preserved.' },
            ].map((item) => (
              <div key={item.col}>
                <div style={{
                  fontSize: 11, fontFamily: 'monospace',
                  color: 'var(--brand-primary-light)', marginBottom: 2,
                }}>
                  {item.col}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: 12, borderRadius: 8,
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Duplicate Handling
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Re-importing the same CSV will update existing orders (matched by ID) rather than creating duplicates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
