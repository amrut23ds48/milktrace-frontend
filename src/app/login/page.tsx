'use client';

// app/login/page.tsx
// ─── MilkTrace Login Page ──────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import styles from './login.module.css';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Phone or email is required'),
  password:   z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.identifier, data.password);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">MT</div>
          <div>
            <h1 className={styles.brandName}>MilkTrace</h1>
            <p className={styles.brandTagline}>Milk Supply Chain Intelligence Platform</p>
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="identifier" className={styles.label}>Phone or Email</label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              className={`${styles.input} ${errors.identifier ? styles.inputError : ''}`}
              placeholder="Enter your phone or email"
              {...register('identifier')}
            />
            {errors.identifier && (
              <span className={styles.fieldError} role="alert">{errors.identifier.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.fieldError} role="alert">{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div className={styles.serverError} role="alert">{serverError}</div>
          )}

          <button
            id="login-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.forgotPassword}>
          <a href="#forgot">Forgot password?</a>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
          <strong>Dev Quick Login:</strong>
          <br/>• Use <code>admin</code> to bypass as Super Admin.
          <br/>• Use <code>village</code> to bypass as Village Admin.
        </div>
      </div>
    </div>
  );
}
