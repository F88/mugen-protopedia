export type Result<T, E> = Success<T> | Failure<E>;

interface Success<T> {
  type: 'success';
  value: T;
}

interface Failure<E> {
  type: 'failure';
  error: E;
}
