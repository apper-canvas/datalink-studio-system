import mockSchema from '@/services/mockData/schema.json'

class SchemaService {
  constructor() {
    this.schemas = new Map()
    // Pre-populate with mock data
    this.schemas.set('demo', mockSchema)
  }

  // Simulate network delay
  delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getSchema(connectionId) {
    await this.delay()
    
    if (!connectionId) {
      throw new Error('Connection ID is required')
    }
    
    // Return cached schema if available
    if (this.schemas.has(connectionId)) {
      const schema = this.schemas.get(connectionId)
      return {
        ...schema,
        lastRefreshed: new Date().toISOString()
      }
    }
    
    // Generate mock schema for new connections
    const mockSchemaData = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', dataType: 'INTEGER', isPrimaryKey: true, nullable: false },
            { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, nullable: false },
            { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, nullable: false },
            { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, nullable: false },
            { name: 'updated_at', dataType: 'TIMESTAMP', isPrimaryKey: false, nullable: true }
          ],
          rowCount: 1250
        },
        {
          name: 'products',
          columns: [
            { name: 'id', dataType: 'INTEGER', isPrimaryKey: true, nullable: false },
            { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, nullable: false },
            { name: 'price', dataType: 'DECIMAL(10,2)', isPrimaryKey: false, nullable: false },
            { name: 'description', dataType: 'TEXT', isPrimaryKey: false, nullable: true },
            { name: 'category_id', dataType: 'INTEGER', isPrimaryKey: false, nullable: false, isForeignKey: true }
          ],
          rowCount: 850
        },
        {
          name: 'orders',
          columns: [
            { name: 'id', dataType: 'INTEGER', isPrimaryKey: true, nullable: false },
            { name: 'user_id', dataType: 'INTEGER', isPrimaryKey: false, nullable: false, isForeignKey: true },
            { name: 'total', dataType: 'DECIMAL(10,2)', isPrimaryKey: false, nullable: false },
            { name: 'status', dataType: 'VARCHAR(50)', isPrimaryKey: false, nullable: false },
            { name: 'order_date', dataType: 'TIMESTAMP', isPrimaryKey: false, nullable: false }
          ],
          rowCount: 3420
        }
      ],
      views: [
        {
          name: 'user_orders_view',
          columns: [
            { name: 'user_name', dataType: 'VARCHAR(255)' },
            { name: 'order_count', dataType: 'INTEGER' },
            { name: 'total_spent', dataType: 'DECIMAL(10,2)' }
          ]
        }
      ],
      procedures: [
        {
          name: 'get_user_stats',
          parameters: [{ name: 'user_id', dataType: 'INTEGER' }]
        }
      ],
      lastRefreshed: new Date().toISOString()
    }
    
    this.schemas.set(connectionId, mockSchemaData)
    return mockSchemaData
  }

  async refreshSchema(connectionId) {
    await this.delay()
    
    if (!connectionId) {
      throw new Error('Connection ID is required')
    }
    
    // Remove cached schema to force refresh
    this.schemas.delete(connectionId)
    
    // Get fresh schema
    return await this.getSchema(connectionId)
  }

  async getTableDetails(connectionId, tableName) {
    await this.delay(200)
    
    const schema = await this.getSchema(connectionId)
    const table = schema.tables.find(t => t.name === tableName)
    
    if (!table) {
      throw new Error(`Table '${tableName}' not found`)
    }
    
    return {
      ...table,
      indexes: [
        { name: `${tableName}_pkey`, columns: ['id'], type: 'PRIMARY KEY' },
        { name: `idx_${tableName}_created_at`, columns: ['created_at'], type: 'INDEX' }
      ],
      constraints: [
        { name: `${tableName}_email_unique`, type: 'UNIQUE', columns: ['email'] }
      ]
    }
  }
}

export default new SchemaService()