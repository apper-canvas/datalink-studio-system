import { toast } from 'react-toastify'

class ConnectionService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'connection'
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "host" } },
          { field: { Name: "port" } },
          { field: { Name: "database" } },
          { field: { Name: "username" } },
          { field: { Name: "password" } },
          { field: { Name: "is_active" } },
          { field: { Name: "last_used" } }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      // Transform database field names to UI field names for backward compatibility
      return response.data.map(conn => ({
        Id: conn.Id,
        name: conn.Name,
        tags: conn.Tags,
        owner: conn.Owner,
        type: conn.type,
        host: conn.host,
        port: conn.port,
        database: conn.database,
        username: conn.username,
        password: conn.password,
        isActive: conn.is_active,
        lastUsed: conn.last_used
      }))
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast.error("Failed to load connections")
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "host" } },
          { field: { Name: "port" } },
          { field: { Name: "database" } },
          { field: { Name: "username" } },
          { field: { Name: "password" } },
          { field: { Name: "is_active" } },
          { field: { Name: "last_used" } }
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      // Transform database field names to UI field names
      const conn = response.data
      return {
        Id: conn.Id,
        name: conn.Name,
        tags: conn.Tags,
        owner: conn.Owner,
        type: conn.type,
        host: conn.host,
        port: conn.port,
        database: conn.database,
        username: conn.username,
        password: conn.password,
        isActive: conn.is_active,
        lastUsed: conn.last_used
      }
    } catch (error) {
      console.error(`Error fetching connection with ID ${id}:`, error)
      toast.error("Failed to load connection")
      return null
    }
  }

  async create(data) {
    try {
      // Transform UI field names to database field names and include only Updateable fields
      const dbData = {
        Name: data.name,
        Tags: data.tags || "",
        Owner: data.owner || null,
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        is_active: false,
        last_used: null
      }
      
      const params = {
        records: [dbData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulRecords.length > 0) {
          const newRecord = successfulRecords[0].data
          // Transform back to UI format
          return {
            Id: newRecord.Id,
            name: newRecord.Name,
            tags: newRecord.Tags,
            owner: newRecord.Owner,
            type: newRecord.type,
            host: newRecord.host,
            port: newRecord.port,
            database: newRecord.database,
            username: newRecord.username,
            password: newRecord.password,
            isActive: newRecord.is_active,
            lastUsed: newRecord.last_used
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating connection:", error)
      toast.error("Failed to create connection")
      return null
    }
  }

  async update(id, data) {
    try {
      // Transform UI field names to database field names and include only Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: data.name,
        Tags: data.tags || "",
        Owner: data.owner || null,
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        is_active: data.isActive !== undefined ? data.isActive : data.is_active,
        last_used: data.lastUsed || data.last_used
      }
      
      const params = {
        records: [dbData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successfulUpdates.length > 0) {
          const updatedRecord = successfulUpdates[0].data
          // Transform back to UI format
          return {
            Id: updatedRecord.Id,
            name: updatedRecord.Name,
            tags: updatedRecord.Tags,
            owner: updatedRecord.Owner,
            type: updatedRecord.type,
            host: updatedRecord.host,
            port: updatedRecord.port,
            database: updatedRecord.database,
            username: updatedRecord.username,
            password: updatedRecord.password,
            isActive: updatedRecord.is_active,
            lastUsed: updatedRecord.last_used
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating connection:", error)
      toast.error("Failed to update connection")
      return null
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting connection:", error)
      toast.error("Failed to delete connection")
      return false
    }
  }

  async testConnection(connectionData) {
    // Simulate connection testing - this would be replaced with actual test logic
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
    // Update connection as active and set last used time
    return await this.update(id, {
      isActive: true,
      lastUsed: new Date().toISOString()
    })
  }

  async disconnect(id) {
    // Update connection as inactive
    return await this.update(id, {
      isActive: false
    })
  }
}

export default new ConnectionService()