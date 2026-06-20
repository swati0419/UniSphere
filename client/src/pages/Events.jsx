 import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Events.module.css'

const CATEGORIES = ['workshop', 'fest', 'sports', 'seminar', 'cultural', 'other']

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'workshop', date: '', time: '', location: '', maxAttendees: '' })
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadEvents() }, [])

  function loadEvents() {
    setLoading(true)
    api.get('/api/events')
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/events', { ...form, maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null })
      setForm({ title: '', description: '', category: 'workshop', date: '', time: '', location: '', maxAttendees: '' })
      setShowForm(false)
      loadEvents()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create event.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRsvp(id) {
    try {
      await api.post(`/api/events/${id}/rsvp`)
      loadEvents()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to RSVP.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return
    await api.delete(`/api/events/${id}`)
    loadEvents()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Events</h1>
          <p className={styles.subtitle}>Workshops, fests, and campus activities</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create event'}
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <input className={styles.input} placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className={styles.textarea} placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className={styles.formRow}>
            <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className={styles.input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input className={styles.input} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </div>
          <div className={styles.formRow}>
            <input className={styles.input} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <input className={styles.input} type="number" placeholder="Max attendees (optional)" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} />
            <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.loading}>Loading events…</p>
      ) : events.length === 0 ? (
        <p className={styles.empty}>No events yet. Be the first to create one!</p>
      ) : (
        <div className={styles.grid}>
          {events.map((ev) => {
            const isAttending = ev.attendees.some((a) => a._id === user?._id || a === user?._id)
            const isFull = ev.maxAttendees && ev.attendees.length >= ev.maxAttendees
            const canDelete = ev.organizer?._id === user?._id || user?.role === 'admin'
            return (
              <div key={ev._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.catBadge}>{ev.category}</span>
                  {canDelete && <button className={styles.deleteBtn} onClick={() => handleDelete(ev._id)}>✕</button>}
                </div>
                <h3 className={styles.cardTitle}>{ev.title}</h3>
                <p className={styles.cardDesc}>{ev.description}</p>
                <div className={styles.cardMeta}>
                  <span>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>🕐 {ev.time}</span>
                  <span>📍 {ev.location}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.attendeeCount}>{ev.attendees.length}{ev.maxAttendees ? `/${ev.maxAttendees}` : ''} attending</span>
                  <button
                    className={isAttending ? styles.rsvpBtnActive : styles.rsvpBtn}
                    onClick={() => handleRsvp(ev._id)}
                    disabled={!isAttending && isFull}
                  >
                    {isAttending ? '✓ Going' : isFull ? 'Full' : 'RSVP'}
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
