import SessionHistoryItem from '../components/SessionHistoryItem.jsx';

export default function SessionHistoryPage({ sessions, onOpen, onStart }) {
  return <main className="history-page">
    <div className="history-hero"><div><div className="page-kicker">YOUR TRAINING, OVER TIME</div><h1>Every session<br/><em>counts.</em></h1><p className="page-subtitle">A quiet record of the work you’ve put in.</p></div><div className="history-mark"><span>R</span><i>✳</i><small>KEEP<br/>GOING</small></div></div>
    <div className="history-toolbar"><div><span className="eyebrow">WORKOUT LOG</span><h2>Session history <span>{sessions.length}</span></h2></div><button className="primary-button start-button" onClick={onStart}>Start a workout <span aria-hidden="true">＋</span></button></div>
    {sessions.length ? <div className="session-list">{sessions.map((session) => <SessionHistoryItem key={session.id} session={session} onOpen={onOpen} />)}</div> : <section className="history-empty"><div className="empty-icon">✳</div><h3>Your first page is still blank.</h3><p>Start a workout and your progress will gather here.</p><button className="primary-button" onClick={onStart}>Start your first workout <span>↗</span></button></section>}
    <footer className="page-footer"><span>REPBOOK · YOUR PERSONAL TRAINING LOG</span><span>ONE SESSION AT A TIME <i>✳</i></span></footer>
  </main>;
}
