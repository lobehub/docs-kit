import { playgroundRoot } from './roots';

// The kit resolves the consumer repository from the process cwd, exactly as the
// lobedocs CLI does, so tests run as if launched from the playground consumer.
process.chdir(playgroundRoot);
