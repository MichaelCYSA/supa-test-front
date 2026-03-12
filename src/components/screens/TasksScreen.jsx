import { useGameStore, formatNumber } from '../../store/useGameStore';

export default function TasksScreen() {
  const { tasks, completedTaskIds, completeTask, user } = useGameStore();
  if (!user) return null;

  const socialTasks = tasks.filter(t => t.type === 'social');
  const achievementTasks = tasks.filter(t => t.type === 'achievement');
  const partnerTasks = tasks.filter(t => t.type === 'partner');

  const completedCount = tasks.filter(t => completedTaskIds.includes(t.id)).length;

  const handleTaskClick = async (task) => {
    const isCompleted = completedTaskIds.includes(task.id);
    if (isCompleted) return;

    // Open link first if applicable
    if (task.external_link) {
      window.Telegram?.WebApp?.openLink
        ? window.Telegram.WebApp.openLink(task.external_link)
        : window.open(task.external_link, '_blank');

      // Auto-complete after opening (user must have visited)
      setTimeout(() => {
        completeTask(task.id);
      }, 2000);
    } else {
      completeTask(task.id);
    }
  };

  const TaskCard = ({ task }) => {
    const done = completedTaskIds.includes(task.id);
    return (
      <div
        onClick={() => !done && handleTaskClick(task)}
        style={{
          background: done ? 'rgba(16,185,129,0.08)' : 'rgba(124,58,237,0.08)',
          border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.2)'}`,
          borderRadius: 14,
          padding: '14px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: done ? 'default' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: done ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>
          {done ? '✅' : task.icon || '⭐'}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 13,
            color: done ? '#6ee7b7' : '#e2d9ff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: 11, color: '#7c6aad', marginTop: 2 }}>
              {task.description}
            </div>
          )}
          {/* Reward */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {task.reward_mana > 0 && (
              <span style={{ fontSize: 11, color: '#c4b5fd' }}>
                ✨ +{formatNumber(task.reward_mana)}
              </span>
            )}
            {task.reward_crystals > 0 && (
              <span style={{ fontSize: 11, color: '#fbbf24' }}>
                💎 +{task.reward_crystals}
              </span>
            )}
          </div>
        </div>

        {/* Arrow/done */}
        <div style={{ color: done ? '#10b981' : '#7c6aad', fontSize: 18, flexShrink: 0 }}>
          {done ? '✓' : '›'}
        </div>
      </div>
    );
  };

  const Section = ({ title, tasks: sectionTasks }) => {
    if (!sectionTasks.length) return null;
    return (
      <div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          color: '#7c6aad',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sectionTasks.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: '#c4b5fd', fontWeight: 700 }}>
            Quests
          </div>
          <div style={{ fontSize: 11, color: '#7c6aad' }}>
            {completedCount}/{tasks.length} completed
          </div>
        </div>
        <div style={{
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 12,
          color: '#c4b5fd',
          fontWeight: 700,
        }}>
          📋 {completedCount}/{tasks.length}
        </div>
      </div>

      {/* Referral card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(30,0,80,0.4))',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 16,
        padding: 16,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#c4b5fd', marginBottom: 4 }}>
          👥 Invite Friends
        </div>
        <div style={{ fontSize: 12, color: '#7c6aad', marginBottom: 12 }}>
          You earn 300 crystals per friend · They get a head start
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => {
              const botUsername = import.meta.env.VITE_BOT_USERNAME || 'ArcaneRealmBot';
              const link = `https://t.me/${botUsername}?startapp=${user.telegram_id}`;
              const text = '🔮 Join Arcane Realm - the best idle wizard game on Telegram!';
              window.Telegram?.WebApp?.openTelegramLink(
                `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
              );
            }}
          >
            📤 Share Link
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '8px 12px' }}
            onClick={() => {
              const botUsername = import.meta.env.VITE_BOT_USERNAME || 'ArcaneRealmBot';
              const link = `https://t.me/${botUsername}?startapp=${user.telegram_id}`;
              navigator.clipboard?.writeText(link);
              useGameStore.getState().showNotification('Link copied!');
            }}
          >
            📋 Copy
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad', marginTop: 8 }}>
          Invited: {user.referral_count || 0} friends
        </div>
      </div>

      <Section title="🌐 Social Tasks" tasks={socialTasks} />
      <Section title="🏆 Achievements" tasks={achievementTasks} />
      <Section title="🤝 Partner Tasks" tasks={partnerTasks} />

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: '#7c6aad', padding: 40 }}>
          No quests available
        </div>
      )}
    </div>
  );
}
