export function createExerciseService(repository) {
  return { list: () => repository.list(), get: (id) => repository.get(id) };
}
