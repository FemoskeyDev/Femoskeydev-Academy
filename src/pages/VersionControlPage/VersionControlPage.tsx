import { useCallback, useEffect, useState } from 'react'
import styles from './VersionControlPage.module.css'

type ChangedFile = { status: string; path: string }
type Commit = { hash: string; subject: string; author: string; date: string; files: ChangedFile[] }

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function summarizeFiles(files: ChangedFile[]) {
  return files.reduce((summary, file) => {
    const kind = file.status[0]
    if (kind === 'A') summary.added += 1
    else if (kind === 'D') summary.removed += 1
    else summary.updated += 1
    return summary
  }, { added: 0, updated: 0, removed: 0 })
}

export function VersionControlPage() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const refreshHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/__femoskey-version-control/history', { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not load the local commit history.')
      const data = await response.json() as { commits: Commit[] }
      setCommits(data.commits)
      setLastUpdated(new Date().toISOString())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the local commit history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshHistory()
    const timer = window.setInterval(() => void refreshHistory(), 30_000)
    return () => window.clearInterval(timer)
  }, [refreshHistory])

  return <main className={styles.page}>
    <header className={styles.heading}>
      <div>
        <p className={styles.eyebrow}><span/> Local workspace · Development only</p>
        <h1>Version <em>control</em></h1>
        <p className={styles.description}>A live record of commits and the files changed in this project.</p>
      </div>
      <button className={styles.refresh} type="button" onClick={() => void refreshHistory()} disabled={loading}>
        <span aria-hidden="true">↻</span> {loading ? 'UPDATING' : 'REFRESH HISTORY'}
      </button>
    </header>

    <div className={styles.summary}>
      <span>{commits.length} {commits.length === 1 ? 'commit' : 'commits'} found</span>
      <span>{lastUpdated ? `Updated ${formatDate(lastUpdated)}` : 'Reading local Git history'}</span>
    </div>

    {error && <p className={styles.message} role="alert">{error} Make sure this project has a Git repository and try refreshing.</p>}
    {!error && !loading && commits.length === 0 && <p className={styles.message}>No commits yet. Once this project has a commit, it will appear here.</p>}

    <ol className={styles.timeline} aria-label="Project commit history" aria-busy={loading}>
      {commits.map((commit, index) => {
        const summary = summarizeFiles(commit.files)
        return <li className={styles.commit} key={commit.hash}>
          <span className={styles.marker} aria-hidden="true"/>
          <article>
            <div className={styles.commitTop}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <time dateTime={commit.date}>{formatDate(commit.date)}</time>
            </div>
            <h2>{commit.subject}</h2>
            <div className={styles.meta}>
              <code>{commit.hash.slice(0, 7)}</code>
              <span>{commit.author}</span>
              <span>{commit.files.length} {commit.files.length === 1 ? 'file' : 'files'}</span>
            </div>
            <div className={styles.fileSummary} aria-label="File change summary">
              {summary.added > 0 && <span className={styles.added}>+{summary.added} added</span>}
              {summary.updated > 0 && <span className={styles.updated}>~{summary.updated} updated</span>}
              {summary.removed > 0 && <span className={styles.removed}>−{summary.removed} removed</span>}
            </div>
            {commit.files.length > 0 && <details className={styles.fileDetails}>
              <summary>View changed files</summary>
              <ul>
                {commit.files.map((file, fileIndex) => <li key={`${file.status}-${file.path}-${fileIndex}`}>
                  <span data-status={file.status[0]}>{file.status[0]}</span>
                  <code>{file.path}</code>
                </li>)}
              </ul>
            </details>}
          </article>
        </li>
      })}
    </ol>
  </main>
}
