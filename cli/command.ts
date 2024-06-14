import { Command } from '@cliffy/command';
import { promptCreation } from './prompt.ts';

await new Command()
  .name('create-new')
  .description('Create new model, controller and router')
  .version('v1.0.0')
  .option('-A, --create-all', 'Create All files')
  .option('-c, --create-controller', 'Create controller file')
  .option('-m, --create-model', 'Create model file')
  .option('-r, --create-router', 'Create router file')
  .arguments('[filename:string]')
  .action(async (options, ...args) => {
    await promptCreation(options, args[0]);
  })
  .parse(Deno.args);
