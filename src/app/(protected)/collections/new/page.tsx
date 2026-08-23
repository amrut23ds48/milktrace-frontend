'use client';

// app/(protected)/collections/new/page.tsx
// ─── Milk Collection Entry Form ────────────────────────────────────────────────
// Designed for speed — tab-optimized, numeric inputs, instant Zod validation.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collectionSchema, type CollectionFormData } from '../../../../schemas/collection.schema';
import styles from './collection.module.css';

// Mock farmer list — replace with SWR fetch from /api/v1/farmers
const MOCK_FARMERS = [
  { code: 'F-001', name: 'Ramesh Jadhav' },
  { code: 'F-002', name: 'Sunita Patil' },
  { code: 'F-003', name: 'Ganesh More' },
  { code: 'F-004', name: 'Meera Kulkarni' },
  { code: 'F-005', name: 'Vijay Shinde' },
];

export default function NewCollectionPage() {
  const [successData, setSuccessData] = useState<CollectionFormData | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
  });

  const farmerCode = watch('farmerCode');
  const selectedFarmer = MOCK_FARMERS.find((f) => f.code === farmerCode);

  const onSubmit = async (data: CollectionFormData) => {
    setServerError(null);
    try {
      // TODO: Replace with real API call: POST /api/v1/collections
      await new Promise((r) => setTimeout(r, 500));
      setSuccessData(data);
      reset();
    } catch {
      setServerError('Failed to record collection. Please try again.');
    }
  };

  const handleRecordNext = () => {
    setSuccessData(null);
  };

  if (successData) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon} aria-hidden="true">✓</div>
          <h2 className={styles.successTitle}>Collection Recorded</h2>
          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span>Farmer</span>
              <strong>{successData.farmerCode}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Volume</span>
              <strong>{successData.volumeLiters} L</strong>
            </div>
            <div className={styles.successRow}>
              <span>Fat %</span>
              <strong>{successData.fatPercent}%</strong>
            </div>
            <div className={styles.successRow}>
              <span>SNF %</span>
              <strong>{successData.snfPercent}%</strong>
            </div>
          </div>
          <button id="record-next-btn" className={styles.recordNextBtn} onClick={handleRecordNext}>
            Record Next Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Record Milk Collection</h1>
        <p className={styles.subheading}>Enter today&apos;s collection details. Use Tab to move between fields.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Farmer */}
          <div className={styles.field}>
            <label htmlFor="farmerCode" className={styles.label}>Farmer <span className={styles.required}>*</span></label>
            <select id="farmerCode" className={`${styles.select} ${errors.farmerCode ? styles.inputError : ''}`} {...register('farmerCode')}>
              <option value="">Select farmer</option>
              {MOCK_FARMERS.map((f) => (
                <option key={f.code} value={f.code}>{f.code} — {f.name}</option>
              ))}
            </select>
            {selectedFarmer && (
              <span className={styles.farmerName}>{selectedFarmer.name}</span>
            )}
            {errors.farmerCode && <span className={styles.fieldError} role="alert">{errors.farmerCode.message}</span>}
          </div>

          {/* Numeric fields row */}
          <div className={styles.numericGrid}>
            <div className={styles.field}>
              <label htmlFor="volumeLiters" className={styles.label}>Volume (L) <span className={styles.required}>*</span></label>
              <input id="volumeLiters" type="number" step="0.1" min={0}
                className={`${styles.input} ${errors.volumeLiters ? styles.inputError : ''}`}
                placeholder="e.g. 24.5"
                {...register('volumeLiters', { valueAsNumber: true })} />
              {errors.volumeLiters && <span className={styles.fieldError} role="alert">{errors.volumeLiters.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="fatPercent" className={styles.label}>Fat % <span className={styles.required}>*</span></label>
              <input id="fatPercent" type="number" step="0.1" min={1} max={10}
                className={`${styles.input} ${errors.fatPercent ? styles.inputError : ''}`}
                placeholder="e.g. 6.2"
                {...register('fatPercent', { valueAsNumber: true })} />
              {errors.fatPercent && <span className={styles.fieldError} role="alert">{errors.fatPercent.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="snfPercent" className={styles.label}>SNF % <span className={styles.required}>*</span></label>
              <input id="snfPercent" type="number" step="0.1" min={6} max={10}
                className={`${styles.input} ${errors.snfPercent ? styles.inputError : ''}`}
                placeholder="e.g. 8.9"
                {...register('snfPercent', { valueAsNumber: true })} />
              {errors.snfPercent && <span className={styles.fieldError} role="alert">{errors.snfPercent.message}</span>}
            </div>
          </div>

          {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => reset()}>Clear</button>
            <button id="collection-submit" type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Recording…' : 'Submit Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
