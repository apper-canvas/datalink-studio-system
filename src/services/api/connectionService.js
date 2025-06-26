import mockConnections from '@/services/mockData/connections.json'

class ConnectionService {
  constructor() {
    this.connections = [...mockConnections]
  }

  // Simulate network delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.connections]
  }

  async getById(id) {
    await this.delay()
    const connection = this.connections.find(conn => conn.Id === id)
    if (!connection) {
      throw new Error('Connection not found')
    }
    return { ...connection }
  }

  async create(data) {
    await this.delay()
    
    // Find highest existing ID
    const maxId = Math.max(...this.connections.map(conn => conn.Id), 0)
    
    const newConnection = {
      Id: maxId + 1,
      ...data,
      isActive: false,
      lastUsed: null
    }
    
    this.connections.push(newConnection)
    return { ...newConnection }
  }

  async update(id, data) {
    await this.delay()
    
    const index = this.connections.findIndex(conn => conn.Id === id)
    if (index === -1) {
      throw new Error('Connection not found')
    }
    
    this.connections[index] = { ...this.connections[index], ...data }
    return { ...this.connections[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.connections.findIndex(conn => conn.Id === id)
    if (index === -1) {
      throw new Error('Connection not found')
    }
    
    this.connections.splice(index, 1)
    return true
  }

  async testConnection(connectionData) {
    await this.delay(500) // Longer delay for testing
    
    // Simulate different test results based on connection data
    if (!connectionData.host || !connectionData.database) {
      throw new Error('Missing required connection parameters')
    }
    
    if (connectionData.host === 'invalid.host') {
      throw new Error('Could not connect to host: Connection refused')
    }
    
    if (connectionData.database === 'nonexistent') {
      throw new Error('Database does not exist')
    }
    
    if (connectionData.username === 'invalid') {
      throw new Error('Authentication failed: Invalid credentials')
    }
    
    return {
      success: true,
      message: 'Connection test successful',
      version: '14.2 (PostgreSQL)',
      responseTime: Math.floor(Math.random() * 100) + 50
    }
  }

  async connect(id) {
    await this.delay()
    
    const connection = this.connections.find(conn => conn.Id === id)
    if (!connection) {
      throw new Error('Connection not found')
    }
    
    // Simulate connection establishment
    if (connection.host === 'invalid.host') {
      throw new Error('Failed to establish connection')
    }
    
    // Update connection status
    const updatedConnection = {
      ...connection,
      isActive: true,
      lastUsed: new Date().toISOString()
    }
    
    const index = this.connections.findIndex(conn => conn.Id === id)
    this.connections[index] = updatedConnection
    
    return { ...updatedConnection }
  }

  async disconnect(id) {
    await this.delay()
    
    const index = this.connections.findIndex(conn => conn.Id === id)
    if (index === -1) {
      throw new Error('Connection not found')
    }
    
    this.connections[index] = {
      ...this.connections[index],
      isActive: false
    }
    
    return { ...this.connections[index] }
  }
}

export default new ConnectionService()