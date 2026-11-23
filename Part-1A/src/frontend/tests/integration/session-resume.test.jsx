import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SessionDetailPage from '../../src/features/workouts/pages/SessionDetailPage.jsx';

const session = (id) => ({ id, title: `Pending ${id}`, status: 'PENDING', startedAt: '2026-11-20T18:00:00+05:30', timeOfDayLabel: 'Evening Workout', exercises: [] });

describe('resuming pending sessions', () => {
  it('can resume different pending sessions independently and complete one', () => {
    const resumeOne = vi.fn();
    const { rerender } = render(<SessionDetailPage session={session(1)} onResume={resumeOne} onRename={vi.fn()} onDelete={vi.fn()} onSaveSets={vi.fn()} onDeleteExercise={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /resume workout/i }));
    expect(resumeOne).toHaveBeenCalledOnce();
    const resumeTwo = vi.fn();
    rerender(<SessionDetailPage session={session(2)} onResume={resumeTwo} onRename={vi.fn()} onDelete={vi.fn()} onSaveSets={vi.fn()} onDeleteExercise={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /resume workout/i }));
    expect(resumeTwo).toHaveBeenCalledOnce();
  });
});
