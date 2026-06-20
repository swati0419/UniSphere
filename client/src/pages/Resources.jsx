 import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Resources.module.css'

const TYPES = ['lost', 'found', 'sell', 'donate', 'borrow']
const CATEGORIES = ['books', 'electronics', 'stationery', 'clothing', 'other']

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({ title: '', description: '', type: 'lost', category: 'other', contactInfo: '' })
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadResources() }, [filterType])

  function loadResources() {
    setLoading(true)
    api.get('/api/resources', { params: filterType ? { type: filterType } : {} })
      .then((r) => setResources(r.data))
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/resources', form)
      setForm({ title: '', description: '', type: 'lost', category: 'other', contactInfo: '' })
      setShowForm(false)
      loadResources()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResolve(id) {
    await api.patch(`/api/resources/${id}/resolve`)
    loadResources()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    await api.delete(`/api/resources/${id}`)
    loadResources()
  }

  const typeEmoji = { lost: '❓', found: '✅', sell: '💰', donate: '🎁', borrow: '🤝' }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.subtitle}>Lost & found, marketplace, and sharing</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New post'}
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <input className={styles.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className={styles.textarea} placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className={styles.formRow}>
            <select className={styles.select} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className={styles.input} placeholder="Contact info" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} required />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post'}</button>
        </form>
      )}

      <div className={styles.filters}>
        <button className={!filterType ? styles.filterActive : styles.filter} onClick={() => setFilterType('')}>All</button>
        {TYPES.map((t) => (
          <button key={t} className={filterType === t ? styles.filterActive : styles.filter} onClick={() => setFilterType(t)}>
            {typeEmoji[t]} {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.loading}>Loading resources…</p>
      ) : resources.length === 0 ? (
        <p className={styles.empty}>No posts yet.</p>
      ) : (
        <div className={styles.grid}>
          {resources.map((r) => {
            const canManage = r.postedBy?._id === user?._id || user?.role === 'admin'
            return (
              <div key={r._id} className={`${styles.card} ${r.status === 'resolved' ? styles.resolvedCard : ''}`}>
                <div className={styles.cardTop}>
                  <span className={styles.typeBadge}>{typeEmoji[r.type]} {r.type}</span>
                  {r.status === 'resolved' && <span className={styles.resolvedBadge}>Resolved</span>}
                  {canManage && <button className={styles.deleteBtn} onClick={() => handleDelete(r._id)}>✕</button>}
                </div>
                <h3 className={styles.cardTitle}>{r.title}</h3>
                <p className={styles.cardDesc}>{r.description}</p>
                <p className={styles.cardContact}>📞 {r.contactInfo}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardMeta}>{r.postedBy?.name}</span>
                  {canManage && r.status === 'open' && (
                    <button className={styles.resolveBtn} onClick={() => handleResolve(r._id)}>Mark resolved</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
