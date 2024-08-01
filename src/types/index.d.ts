import { ZodIssue } from 'zod';

type ActionResult<T> =
  // It can either be successful.
  // And if it is then we're going to return the data which is going to be of a certain type.
  // It's going to be a user, an array of users, an array of members, an array of messages.
  // Whatever the type is, that's what we're going to return.
  | { status: 'success'; data: T }

  // if we've got an error, then we're going to return a different kind of property,
  // an error that's going to be a string or it's going to be an array of Zod issues.
  | { status: 'error'; error: string | ZodIssue[] };
