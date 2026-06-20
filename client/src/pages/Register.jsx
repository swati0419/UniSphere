import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password, role, department, year })
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#6d4ce8" />
            <circle cx="11" cy="8" r="3" fill="white" />
            <path d="M5 17c0-3 2.5-5 6-5s6 2 6 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className={styles.logoName}>UniSphere</span>
        </div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join your campus community</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.roleToggle}>
            <button type="button" className={role === 'student' ? styles.roleBtnActive : styles.roleBtn} onClick={() => setRole('student')}>
              🎓 Student
            </button>
            <button type="button" className={role === 'admin' ? styles.roleBtnActive : styles.roleBtn} onClick={() => setRole('admin')}>
              🛡️ Admin
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {role === 'student' && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Department</label>
                <input className={styles.input} type="text" placeholder="e.g. CSE" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Year</label>
                <select className={styles.select} value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Select</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className={styles.switch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
} 
