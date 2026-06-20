 import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Forum.module.css'

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadPosts() }, [])

  function loadPosts() {
    setLoading(true)
    api.get('/api/forum')
      .then((r) => setPosts(r.data))
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean)
      await api.post('/api/forum', { title, content, tags: tagArray })
      setTitle(''); setContent(''); setTags('')
      setShowForm(false)
      loadPosts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpvote(id, e) {
    e.preventDefault()
    await api.post(`/api/forum/${id}/upvote`)
    loadPosts()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Forum</h1>
          <p className={styles.subtitle}>Ask questions, share knowledge</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New question'}
        </button>
      </div>

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <input className={styles.input} placeholder="Question title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className={styles.textarea} placeholder="Describe your question…" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
          <input className={styles.input} placeholder="Tags (comma separated, e.g. dsa, exams)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post question'}</button>
        </form>
      )}

      {loading ? (
        <p className={styles.loading}>Loading forum…</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>No questions yet. Ask the first one!</p>
      ) : (
        <div className={styles.list}>
          {posts.map((p) => {
            const isUpvoted = p.upvotes.some((u) => u === user?._id || u?._id === user?._id)
            return (
              <Link to={`/forum/${p._id}`} key={p._id} className={styles.card}>
                <button className={isUpvoted ? styles.upvoteBtnActive : styles.upvoteBtn} onClick={(e) => handleUpvote(p._id, e)}>
                  ▲ {p.upvotes.length}
                </button>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.cardDesc}>{p.content}</p>
                  <div className={styles.cardFooter}>
                    {p.tags.map((t) => <span key={t} className={styles.tag}>#{t}</span>)}
                    <span className={styles.cardMeta}>{p.replies.length} replies · {p.postedBy?.name}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
