import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './StudyGroups.module.css'

export default function StudyGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', description: '', maxMembers: 10, meetingSchedule: '', meetingMode: 'offline' })
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadGroups() }, [])

  function loadGroups() {
    setLoading(true)
    api.get('/api/study-groups')
      .then((r) => setGroups(r.data))
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/study-groups', { ...form, maxMembers: Number(form.maxMembers) })
      setForm({ name: '', subject: '', description: '', maxMembers: 10, meetingSchedule: '', meetingMode: 'offline' })
      setShowForm(false)
      loadGroups()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin(id) {
    try {
      await api.post(`/api/study-groups/${id}/join`)
      loadGroups()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this study group?')) return
    await api.delete(`/api/study-groups/${id}`)
    loadGroups()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Study Groups</h1>
          <p className={styles.subtitle}>Find or start a group for any subject</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create group'}
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <input className={styles.input} placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className={styles.input} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <textarea className={styles.textarea} placeholder="What will you study together?" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className={styles.formRow}>
            <input className={styles.input} placeholder="Meeting schedule (e.g. Tue/Thu 5pm)" value={form.meetingSchedule} onChange={(e) => setForm({ ...form, meetingSchedule: e.target.value })} />
            <select className={styles.select} value={form.meetingMode} onChange={(e) => setForm({ ...form, meetingMode: e.target.value })}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input className={styles.input} type="number" placeholder="Max members" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} min="2" />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create group'}</button>
        </form>
      )}

      {loading ? (
        <p className={styles.loading}>Loading study groups…</p>
      ) : groups.length === 0 ? (
        <p className={styles.empty}>No study groups yet. Start one!</p>
      ) : (
        <div className={styles.grid}>
          {groups.map((g) => {
            const isMember = g.members.some((m) => m._id === user?._id || m === user?._id)
            const isFull = g.members.length >= g.maxMembers
            const canDelete = g.createdBy?._id === user?._id || user?.role === 'admin'
            return (
              <div key={g._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.subjectBadge}>{g.subject}</span>
                  {canDelete && <button className={styles.deleteBtn} onClick={() => handleDelete(g._id)}>✕</button>}
                </div>
                <h3 className={styles.cardTitle}>{g.name}</h3>
                <p className={styles.cardDesc}>{g.description}</p>
                <div className={styles.cardMeta}>
                  {g.meetingSchedule && <span>🕐 {g.meetingSchedule}</span>}
                  <span>{g.meetingMode === 'online' ? '💻' : g.meetingMode === 'hybrid' ? '🔄' : '📍'} {g.meetingMode}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.memberCount}>{g.members.length}/{g.maxMembers} members</span>
                  <button
                    className={isMember ? styles.joinBtnActive : styles.joinBtn}
                    onClick={() => handleJoin(g._id)}
                    disabled={!isMember && isFull}
                  >
                    {isMember ? '✓ Joined' : isFull ? 'Full' : 'Join'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 
