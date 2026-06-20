 import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Forum.module.css'

export default function ForumPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadPost() }, [id])

  function loadPost() {
    setLoading(true)
    api.get(`/api/forum/${id}`)
      .then((r) => setPost(r.data))
      .finally(() => setLoading(false))
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!reply.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/api/forum/${id}/reply`, { content: reply })
      setPost(data)
      setReply('')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reply.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpvote() {
    const { data } = await api.post(`/api/forum/${id}/upvote`)
    setPost(data)
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading…</p>
  if (!post) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Post not found.</p>

  const isUpvoted = post.upvotes.some((u) => u === user?._id || u?._id === user?._id)

  return (
    <div>
      <Link to="/forum" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-block', marginBottom: 12 }}>← Back to forum</Link>

      <div className={styles.card} style={{ cursor: 'default' }}>
        <button className={isUpvoted ? styles.upvoteBtnActive : styles.upvoteBtn} onClick={handleUpvote}>
          ▲ {post.upvotes.length}
        </button>
        <div className={styles.cardBody}>
          <h1 className={styles.cardTitle} style={{ fontSize: 19 }}>{post.title}</h1>
          <p className={styles.cardDesc} style={{ WebkitLineClamp: 'unset' }}>{post.content}</p>
          <div className={styles.cardFooter}>
            {post.tags.map((t) => <span key={t} className={styles.tag}>#{t}</span>)}
            <span className={styles.cardMeta}>{post.postedBy?.name} · {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>{post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}</h3>

      <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <input
          className={styles.input}
          style={{ flex: 1 }}
          placeholder="Write a reply…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? '…' : 'Reply'}</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {post.replies.map((r) => (
          <div key={r._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 6 }}>{r.content}</p>
            <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>{r.postedBy?.name} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
