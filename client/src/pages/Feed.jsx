 import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Feed.module.css'

const CATEGORIES = ['general', 'academic', 'administrative', 'event', 'urgent']

export default function Feed() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [pinned, setPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadAnnouncements() }, [])

  function loadAnnouncements() {
    setLoading(true)
    api.get('/api/announcements')
      .then((r) => setAnnouncements(r.data))
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/announcements', { title, content, category, pinned })
      setTitle(''); setContent(''); setCategory('general'); setPinned(false)
      setShowForm(false)
      loadAnnouncements()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this announcement?')) return
    await api.delete(`/api/announcements/${id}`)
    loadAnnouncements()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Campus Feed</h1>
          <p className={styles.subtitle}>Official announcements and updates</p>
        </div>
        {user?.role === 'admin' && (
          <button className={styles.newBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New announcement'}
          </button>
        )}
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <input className={styles.input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className={styles.textarea} placeholder="What's the announcement?" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
          <div className={styles.formRow}>
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> Pin to top
            </label>
            <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.loading}>Loading announcements…</p>
      ) : announcements.length === 0 ? (
        <p className={styles.empty}>No announcements yet.</p>
      ) : (
        <div className={styles.list}>
          {announcements.map((a) => (
            <div key={a._id} className={`${styles.card} ${a.pinned ? styles.pinnedCard : ''}`}>
              <div className={styles.cardTop}>
                <span className={styles.catBadge}>{a.category}</span>
                {a.pinned && <span className={styles.pinBadge}>📌 Pinned</span>}
                {user?.role === 'admin' && (
                  <button className={styles.deleteBtn} onClick={() => handleDelete(a._id)}>✕</button>
                )}
              </div>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <p className={styles.cardContent}>{a.content}</p>
              <p className={styles.cardMeta}>{a.postedBy?.name} · {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
