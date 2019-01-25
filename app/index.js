require.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' }})
require(['vs/editor/editor.main'], function() {
  window.editor = monaco.editor.create(document.getElementById('container'), {
    value: 'select * from tb_user;',
    language: 'sql',
    fontSize: 14,
    minimap: {
      enabled: false
    },
    suggestOnTriggerCharacters: true
  });
  monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: [' '],
    provideCompletionItems(model, position) {
      const {lineNumber, column} = position
      const textBeforePointer = model.getValueInRange({
        startLineNumber: lineNumber,
        startColumn: 0,
        endLineNumber: lineNumber,
        endColumn: column
      })
      const tokens = textBeforePointer.trim().split(/\s+/)
      if (tokens[tokens.length - 1] === 'from') {
        return {
          suggestions: [
            'tb_user',
            'tb_platform',
            'tb_log',
            'tb_connections'
          ].map(renderTable)
        }
      }
      return {suggestions: []}
    }
  })

  function renderTable(name) {
    return {
      label: name,
      kind: monaco.languages.CompletionItemKind.Text,
      detail: name,
      documentation: name,
      insertText: name
    }
  }
});