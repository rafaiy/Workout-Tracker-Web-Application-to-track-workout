import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExerciseEntryForm from '../../src/features/workouts/components/ExerciseEntryForm.jsx';

describe('ExerciseEntryForm data entry', () => {
  it('saves valid zero and fractional weights and allows reducing to one set', async () => {
    const save = vi.fn().mockResolvedValue({});
    render(<ExerciseEntryForm exercises={[{ id: 1, name: 'Shoulder Press' }]} onSave={save} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove set 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove set 2' }));
    fireEvent.change(screen.getByLabelText('Set 1 weight in kilograms'), { target: { value: '0.1' } });
    fireEvent.change(screen.getByLabelText('Set 1 reps'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Add exercise to session/ }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(1, [{ setNumber: 1, weightKg: 0.1, reps: 10 }]));
  });
  it('rejects invalid precision and invalid rep count before saving', async () => {
    const save = vi.fn();
    render(<ExerciseEntryForm exercises={[{ id: 1, name: 'Chest Fly' }]} onSave={save} />);
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(screen.getByLabelText(`Set ${i} weight in kilograms`), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(`Set ${i} reps`), { target: { value: '10' } });
    }
    fireEvent.change(screen.getByLabelText('Set 1 weight in kilograms'), { target: { value: '12.35' } });
    fireEvent.change(screen.getByLabelText('Set 1 reps'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Add exercise to session/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('0.1 kg increments');
    expect(save).not.toHaveBeenCalled();
  });
});
