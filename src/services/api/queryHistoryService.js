import mockHistory from '@/services/mockData/queryHistory.json'

class QueryHistoryService {
  constructor() {
    this.history = [...mockHistory]
  }

  // Simulate network delay
  delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    // Return history sorted by execution time (newest first)
    return [...this.history].sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
  }

  async getById(id) {
    await this.delay()
    const query = this.history.find(q => q.Id === id)
    if (!query) {
      throw new Error('Query not found in history')
    }
    return { ...query }
  }

  async create(data) {
    await this.delay()
    
    // Find highest existing ID
    const maxId = Math.max(...this.history.map(q => q.Id), 0)
    
    const newQuery = {
      Id: maxId + 1,
      ...data,
      executedAt: data.executedAt || new Date().toISOString()
    }
    
    this.history.push(newQuery)
    return { ...newQuery }
  }

  async update(id, data) {
    await this.delay()
    
    const index = this.history.findIndex(q => q.Id === id)
    if (index === -1) {
      throw new Error('Query not found in history')
    }
    
    this.history[index] = { ...this.history[index], ...data }
    return { ...this.history[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.history.findIndex(q => q.Id === id)
    if (index === -1) {
      throw new Error('Query not found in history')
    }
    
    this.history.splice(index, 1)
    return true
  }

  async getByConnection(connectionId) {
    await this.delay()
    return this.history
      .filter(q => q.connectionId === connectionId)
      .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
  }

  async getSuccessful() {
    await this.delay()
    return this.history
      .filter(q => !q.error)
      .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
  }

  async getErrors() {
    await this.delay()
    return this.history
      .filter(q => q.error)
      .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
  }

  async search(searchTerm) {
    await this.delay()
    const term = searchTerm.toLowerCase()
    return this.history
      .filter(q => 
        q.sql.toLowerCase().includes(term) ||
        q.connectionName?.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
  }

  async clearAll() {
    await this.delay()
    this.history = []
    return true
  }
}

export default new QueryHistoryService()