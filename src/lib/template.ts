/**
 * Parse [variable] placeholders from a prompt template.
 * Returns unique variable names in order of first appearance.
 */
export function parseVariables(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const variables: string[] = [];
  for (const match of matches) {
    const name = match.slice(1, -1);
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }
  return variables;
}

/**
 * Expand a prompt template with all combinations of variable values.
 * Returns an array of { expandedPrompt, variableValues } objects.
 */
export function expandCombinations(
  template: string,
  variables: Record<string, string[]>
): { expandedPrompt: string; variableValues: Record<string, string> }[] {
  const varNames = parseVariables(template);

  // Filter to only variables that have values provided
  const activeVars = varNames.filter((name) => variables[name]?.length > 0);

  if (activeVars.length === 0) {
    return [{ expandedPrompt: template, variableValues: {} }];
  }

  // Generate cartesian product of all variable values
  const combinations: Record<string, string>[] = [{}];

  for (const varName of activeVars) {
    const values = variables[varName];
    const newCombinations: Record<string, string>[] = [];
    for (const combo of combinations) {
      for (const value of values) {
        newCombinations.push({ ...combo, [varName]: value });
      }
    }
    combinations.length = 0;
    combinations.push(...newCombinations);
  }

  // Apply each combination to the template
  return combinations.map((variableValues) => {
    let expanded = template;
    for (const [name, value] of Object.entries(variableValues)) {
      expanded = expanded.replaceAll(`[${name}]`, value);
    }
    return { expandedPrompt: expanded, variableValues };
  });
}
