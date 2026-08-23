'use client';

// app/(protected)/farmers/register/page.tsx
// ─── Farmer Registration Form ──────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmerSchema, type FarmerFormData } from '../../../../schemas/farmer.schema';
import styles from './register.module.css';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar',
  'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
];

export default function FarmerRegisterPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: { animalCount: 0 },
  });

  const onSubmit = async (data: FarmerFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      // TODO: Replace with real API call: POST /api/v1/farmers
      await new Promise((r) => setTimeout(r, 600)); // mock latency
      // eslint-disable-next-line no-console
      console.log('Farmer registration payload:', data);
      setSuccessMsg(`Farmer "${data.name}" registered successfully.`);
      reset();
    } catch {
      setServerError('Failed to register farmer. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Register New Farmer</h1>
        <p className={styles.subheading}>Add a farmer to the MilkTrace system to begin tracking collections.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.grid}>
            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Full Name <span className={styles.required}>*</span></label>
              <input id="name" type="text" className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="e.g. Ramesh Jadhav" {...register('name')} />
              {errors.name && <span className={styles.fieldError} role="alert">{errors.name.message}</span>}
            </div>

            {/* Phone */}
            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
              <input id="phone" type="tel" inputMode="numeric" className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="10-digit mobile number" {...register('phone')} />
              {errors.phone && <span className={styles.fieldError} role="alert">{errors.phone.message}</span>}
            </div>

            {/* Village */}
            <div className={styles.field}>
              <label htmlFor="village" className={styles.label}>Village <span className={styles.required}>*</span></label>
              <input id="village" type="text" className={`${styles.input} ${errors.village ? styles.inputError : ''}`}
                placeholder="Village name" {...register('village')} />
              {errors.village && <span className={styles.fieldError} role="alert">{errors.village.message}</span>}
            </div>

            {/* District */}
            <div className={styles.field}>
              <label htmlFor="district" className={styles.label}>District <span className={styles.required}>*</span></label>
              <select id="district" className={`${styles.select} ${errors.district ? styles.inputError : ''}`} {...register('district')}>
                <option value="">Select district</option>
                {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.district && <span className={styles.fieldError} role="alert">{errors.district.message}</span>}
            </div>

            {/* Animal Count */}
            <div className={styles.field}>
              <label htmlFor="animalCount" className={styles.label}>Total Animals</label>
              <input id="animalCount" type="number" min={0} className={`${styles.input} ${errors.animalCount ? styles.inputError : ''}`}
                placeholder="0" {...register('animalCount', { valueAsNumber: true })} />
              {errors.animalCount && <span className={styles.fieldError} role="alert">{errors.animalCount.message}</span>}
            </div>
          </div>

          {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
          {successMsg  && <div className={styles.successMsg} role="status">{successMsg}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => reset()}>Clear</button>
            <button id="farmer-register-submit" type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
