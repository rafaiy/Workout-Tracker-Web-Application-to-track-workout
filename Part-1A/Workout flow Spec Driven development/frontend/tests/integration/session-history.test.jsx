import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SessionHistoryPage from '../../src/features/workouts/pages/SessionHistoryPage.jsx';

describe('session history', () => {
  it('shows an actionable empty state', () => {
    const onStart = vi.fn();
    render(<SessionHistoryPage sessions={[]} onStart={onStart} onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /start your first workout/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });
  it('renders newest-first sessions with date, time, and readable status labels', () => {
    const onOpen = vi.fn();
    const sessions = [
      { id: 2, title: 'Evening Workout', status: 'PENDING', startedAt: '2026-11-20T18:00:00+05:30', timeOfDayLabel: 'Evening Workout' },
      { id: 1, title: 'Morning Workout', status: 'COMPLETED', startedAt: '2026-11-19T07:00:00+05:30', timeOfDayLabel: 'Morning Workout' }
    ];
    const { container } = render(<SessionHistoryPage sessions={sessions} onOpen={onOpen} onStart={vi.fn()} />);
    const cards = container.querySelectorAll('.session-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Pending');
    expect(cards[0]).toHaveTextContent('Evening Workout');
    expect(cards[1]).toHaveTextContent('Completed');
    fireEvent.click(cards[0]);
    expect(onOpen).toHaveBeenCalledWith(2);
  });
});
