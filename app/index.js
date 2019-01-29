require.config({ paths: { 'vs': './vs' }})
require(['vs/editor/editor.main'], function() {
  const SORT_TEXT = {
    Table: '0',
    Column: '1',
    Keyword: '2'
  }
  const db_keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'ORDER BY',
    'ASC',
    'DESC'
  ]
  const db_schema = window.db_schema = {
    tables: [
      'tb_user',
      'tb_log'
    ],
    table_columns: {
      tb_user: [
        {name: 'user_id', type: 'varchar'},
        {name: 'user_name', type: 'varchar'}
      ],
      tb_log: [
        {name: 'log_id', type: 'varchar'},
        {name: 'log_create_time', type: 'varchar'},
        {name: 'log_type', type: 'varchar'},
        {name: 'log_content', type: 'varchar'},
      ]
    }
  }
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
    triggerCharacters: [' ', '.'],
    provideCompletionItems(model, position) {
      const {lineNumber, column} = position
      const textBeforePointer = model.getValueInRange({
        startLineNumber: lineNumber,
        startColumn: 0,
        endLineNumber: lineNumber,
        endColumn: column
      })
      const tokens = textBeforePointer.trim().split(/\s+/)
      const lastToken = tokens[tokens.length - 1].toLowerCase()
      if (lastToken === 'from') {
        return {
          suggestions: db_schema.tables.map(renderTable)
        }
      } else if (lastToken === 'select') {
        return {
          suggestions: getAllTableColumnCompletionItems()
        }
      }
      return {
        suggestions: db_schema.tables.map(renderTable)
          .concat(getAllTableColumnCompletionItems())
          .concat(db_keywords.map(renderKeyword))
      }
    }
  })

  function getAllTableColumnCompletionItems() {
    const table_columns = []
    Object.keys(db_schema.table_columns).forEach(table => {
      db_schema.table_columns[table].forEach(column => {
        table_columns.push(renderTableColumn(table, column))
      })
    })
    return table_columns
  }

  function renderKeyword(keyword) {
    return {
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: '',
      sortText: SORT_TEXT.Keyword,
      insertText: keyword
    }
  }

  function renderTable(name) {
    return {
      label: name,
      kind: monaco.languages.CompletionItemKind.Module,
      detail: '<table>',
      sortText: SORT_TEXT.Table,
      insertText: name
    }
  }

  function renderTableColumn(table, column) {
    return {
      label: column.name,
      kind: monaco.languages.CompletionItemKind.Field,
      detail: '<column> ' + column.type + ' ' + table,
      sortText: SORT_TEXT.Column,
      insertText: column.name
    }
  }
});