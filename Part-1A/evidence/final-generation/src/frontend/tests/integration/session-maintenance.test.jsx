import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SessionDetailPage from '../../src/features/workouts/pages/SessionDetailPage.jsx';

const saved = {
  id: 4, title: 'Evening Workout', status: 'PENDING', startedAt: '2026-11-20T18:00:00+05:30',
  timeOfDayLabel: 'Evening Workout', exercises: [{ id: 8, name: 'Chest Fly', sets: [{ id: 9, setNumber: 1, weightKg: 20, reps: 15 }] }]
};
const renderDetail = (overrides = {}) => render(<SessionDetailPage session={saved} onResume={vi.fn()} onRename={vi.fn().mockResolvedValue({})} onDelete={vi.fn()} onSaveSets={vi.fn().mockResolvedValue({})} onDeleteExercise={vi.fn()} {...overrides} />);

describe('session maintenance', () => {
  it('renames a session and edits existing set values', async () => {
    const onRename = vi.fn().mockResolvedValue({});
    const onSaveSets = vi.fn().mockResolvedValue({});
    renderDetail({ onRename, onSaveSets });
    fireEvent.click(screen.getByRole('button', { name: 'Edit session' }));
    fireEvent.change(screen.getByLabelText('Session title'), { target: { value: 'Push day' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ title: 'Push day' })));
    fireEvent.click(screen.getByRole('button', { name: 'Edit sets' }));
    fireEvent.change(screen.getByLabelText('Edit set 1 weight'), { target: { value: '22.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save sets' }));
    await waitFor(() => expect(onSaveSets).toHaveBeenCalledWith(8, [{ setNumber: 1, weightKg: 22.5, reps: 15 }]));
  });
  it('preserves data on canceled deletion and invokes deletion only on confirmation', () => {
    const onDelete = vi.fn();
    renderDetail({ onDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Delete session' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete session' }));
    fireEvent.click(screen.getByRole('alertdialog').querySelector('button.danger-button'));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
