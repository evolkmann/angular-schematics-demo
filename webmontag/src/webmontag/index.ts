import { apply, FileEntry, forEach, MergeStrategy, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { join, normalize } from 'path';

export function setupOptions(host: Tree, options: any): Tree {
  // Load the configuration from the host's angular.json
  const workspace = getWorkspace(host);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];

  options.path = join(normalize(project.root), 'src');
  return host;
}

export function webmontag(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Collect info about the project's "src" location
    setupOptions(tree, _options);

    const movePath = normalize(_options.path + '/');
    const templateSource = apply(url('./files/src'), [
      template({ ..._options }),
      move(movePath),
      // fix for https://github.com/angular/angular-cli/issues/11337
      forEach((fileEntry: FileEntry) => {
        if (tree.exists(fileEntry.path)) {
          tree.overwrite(fileEntry.path, fileEntry.content);
        }
        return fileEntry;
      }),
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, _context);
  };
}
