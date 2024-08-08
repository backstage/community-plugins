import { extractWorkflowFormat } from './workflow';

describe('extractWorkflowFormat', () => {
  it('should return "json" when input is valid JSON', () => {
    const source = '{"name": "workflow", "steps": ["step1", "step2"]}';
    expect(extractWorkflowFormat(source)).toEqual('json');
  });

  it('should return "yaml" when input is valid YAML', () => {
    const source = 'name: workflow\nsteps:\n  - step1\n  - step2\n';
    expect(extractWorkflowFormat(source)).toEqual('yaml');
  });
});
