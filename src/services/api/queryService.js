import mockQueryResults from '@/services/mockData/queryResults.json'

class QueryService {
  constructor() {
    this.queryResults = { ...mockQueryResults }
  }

  // Simulate network delay
  delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async executeQuery(connectionId, sql) {
    await this.delay()
    
    if (!connectionId) {
      throw new Error('No connection specified')
    }
    
    if (!sql || !sql.trim()) {
      throw new Error('No query provided')
    }
    
    const queryType = this.getQueryType(sql)
    const startTime = Date.now()
    
    try {
      let result
      
      switch (queryType) {
        case 'SELECT':
          result = await this.executeSelect(sql)
          break
        case 'INSERT':
          result = await this.executeInsert(sql)
          break
        case 'UPDATE':
          result = await this.executeUpdate(sql)
          break
        case 'DELETE':
          result = await this.executeDelete(sql)
          break
        case 'CREATE':
          result = await this.executeCreate(sql)
          break
        case 'DROP':
          result = await this.executeDrop(sql)
          break
        case 'SHOW':
          result = await this.executeShow(sql)
          break
        default:
          result = await this.executeGeneric(sql)
      }
      
      const executionTime = Date.now() - startTime
      
      return {
        ...result,
        executionTime,
        query: sql,
        connectionId,
        executedAt: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`)
    }
  }

  getQueryType(sql) {
    const cleanSql = sql.trim().toUpperCase()
    if (cleanSql.startsWith('SELECT')) return 'SELECT'
    if (cleanSql.startsWith('INSERT')) return 'INSERT'
    if (cleanSql.startsWith('UPDATE')) return 'UPDATE'
    if (cleanSql.startsWith('DELETE')) return 'DELETE'
    if (cleanSql.startsWith('CREATE')) return 'CREATE'
    if (cleanSql.startsWith('DROP')) return 'DROP'
    if (cleanSql.startsWith('SHOW')) return 'SHOW'
    return 'OTHER'
  }

  async executeSelect(sql) {
    // Simulate different SELECT results based on query content
    if (sql.toLowerCase().includes('users')) {
      return {
        columns: ['id', 'name', 'email', 'created_at', 'status'],
        data: this.queryResults.users.map(user => ({ ...user }))
      }
    }
    
    if (sql.toLowerCase().includes('products')) {
      return {
        columns: ['id', 'name', 'price', 'category', 'stock'],
        data: this.queryResults.products.map(product => ({ ...product }))
      }
    }
    
    if (sql.toLowerCase().includes('orders')) {
      return {
        columns: ['id', 'user_id', 'total', 'status', 'order_date'],
        data: this.queryResults.orders.map(order => ({ ...order }))
      }
    }
    
    if (sql.toLowerCase().includes('count(*)')) {
      return {
        columns: ['count'],
        data: [{ count: Math.floor(Math.random() * 1000) + 100 }]
      }
    }
    
    // Default sample data
    return {
      columns: ['id', 'name', 'value'],
      data: [
        { id: 1, name: 'Sample Record 1', value: 'Data 1' },
        { id: 2, name: 'Sample Record 2', value: 'Data 2' },
        { id: 3, name: 'Sample Record 3', value: 'Data 3' }
      ]
    }
  }

  async executeInsert(sql) {
    const affectedRows = 1
    return {
      columns: ['affected_rows'],
      data: [{ affected_rows: affectedRows }],
      message: `${affectedRows} row(s) inserted successfully`
    }
  }

  async executeUpdate(sql) {
    const affectedRows = Math.floor(Math.random() * 5) + 1
    return {
      columns: ['affected_rows'],
      data: [{ affected_rows: affectedRows }],
      message: `${affectedRows} row(s) updated successfully`
    }
  }

  async executeDelete(sql) {
    const affectedRows = Math.floor(Math.random() * 3) + 1
    return {
      columns: ['affected_rows'],
      data: [{ affected_rows: affectedRows }],
      message: `${affectedRows} row(s) deleted successfully`
    }
  }

  async executeCreate(sql) {
    return {
      columns: ['result'],
      data: [{ result: 'Table created successfully' }],
      message: 'CREATE statement executed successfully'
    }
  }

  async executeDrop(sql) {
    return {
      columns: ['result'],
      data: [{ result: 'Table dropped successfully' }],
      message: 'DROP statement executed successfully'
    }
  }

  async executeShow(sql) {
    if (sql.toLowerCase().includes('tables')) {
      return {
        columns: ['table_name'],
        data: [
          { table_name: 'users' },
          { table_name: 'products' },
          { table_name: 'orders' },
          { table_name: 'categories' },
          { table_name: 'customers' }
        ]
      }
    }
    
    return {
      columns: ['info'],
      data: [{ info: 'Command executed successfully' }]
    }
  }

  async executeGeneric(sql) {
    return {
      columns: ['result'],
      data: [{ result: 'Query executed successfully' }],
      message: 'Statement executed successfully'
    }
  }
}

export default new QueryService()