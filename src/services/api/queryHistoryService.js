import { toast } from 'react-toastify'

class QueryHistoryService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'query_history'
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ],
        orderBy: [
          {
            fieldName: "executed_at",
            sorttype: "DESC"
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      // Transform database field names to UI field names for backward compatibility
      return response.data.map(query => ({
        Id: query.Id,
        name: query.Name,
        tags: query.Tags,
        owner: query.Owner,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }))
    } catch (error) {
      console.error("Error fetching query history:", error)
      toast.error("Failed to load query history")
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
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      // Transform database field names to UI field names
      const query = response.data
      return {
        Id: query.Id,
        name: query.Name,
        tags: query.Tags,
        owner: query.Owner,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }
    } catch (error) {
      console.error(`Error fetching query with ID ${id}:`, error)
      toast.error("Failed to load query")
      return null
    }
  }

  async create(data) {
    try {
      // Transform UI field names to database field names and include only Updateable fields
      const dbData = {
        Name: data.name || `Query ${new Date().toISOString()}`,
        Tags: data.tags || "",
        Owner: data.owner || null,
        connection_name: data.connectionName,
        sql: data.sql,
        executed_at: data.executedAt || new Date().toISOString(),
        execution_time: data.executionTime,
        row_count: data.rowCount || 0,
        error: data.error || null,
        connection_id: data.connectionId
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
            connectionId: newRecord.connection_id?.Id || newRecord.connection_id,
            connectionName: newRecord.connection_name,
            sql: newRecord.sql,
            executedAt: newRecord.executed_at,
            executionTime: newRecord.execution_time,
            rowCount: newRecord.row_count,
            error: newRecord.error
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating query history:", error)
      toast.error("Failed to save query history")
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
        connection_name: data.connectionName,
        sql: data.sql,
        executed_at: data.executedAt,
        execution_time: data.executionTime,
        row_count: data.rowCount || 0,
        error: data.error || null,
        connection_id: data.connectionId
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
            connectionId: updatedRecord.connection_id?.Id || updatedRecord.connection_id,
            connectionName: updatedRecord.connection_name,
            sql: updatedRecord.sql,
            executedAt: updatedRecord.executed_at,
            executionTime: updatedRecord.execution_time,
            rowCount: updatedRecord.row_count,
            error: updatedRecord.error
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating query history:", error)
      toast.error("Failed to update query history")
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
      console.error("Error deleting query history:", error)
      toast.error("Failed to delete query history")
      return false
    }
  }

  // Helper methods for filtering (using database queries for better performance)
  async getByConnection(connectionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ],
        where: [
          {
            FieldName: "connection_id",
            Operator: "EqualTo",
            Values: [parseInt(connectionId)]
          }
        ],
        orderBy: [
          {
            fieldName: "executed_at",
            sorttype: "DESC"
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data.map(query => ({
        Id: query.Id,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }))
    } catch (error) {
      console.error("Error fetching queries by connection:", error)
      return []
    }
  }

  async getSuccessful() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ],
        where: [
          {
            FieldName: "error",
            Operator: "DoesNotHaveValue",
            Values: []
          }
        ],
        orderBy: [
          {
            fieldName: "executed_at",
            sorttype: "DESC"
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data.map(query => ({
        Id: query.Id,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }))
    } catch (error) {
      console.error("Error fetching successful queries:", error)
      return []
    }
  }

  async getErrors() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ],
        where: [
          {
            FieldName: "error",
            Operator: "HasValue",
            Values: []
          }
        ],
        orderBy: [
          {
            fieldName: "executed_at",
            sorttype: "DESC"
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data.map(query => ({
        Id: query.Id,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }))
    } catch (error) {
      console.error("Error fetching error queries:", error)
      return []
    }
  }

  async search(searchTerm) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "connection_name" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "error" } },
          { field: { Name: "connection_id" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "sql",
                    operator: "Contains",
                    values: [searchTerm]
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "connection_name",
                    operator: "Contains",
                    values: [searchTerm]
                  }
                ],
                operator: "OR"
              }
            ]
          }
        ],
        orderBy: [
          {
            fieldName: "executed_at",
            sorttype: "DESC"
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data.map(query => ({
        Id: query.Id,
        connectionId: query.connection_id?.Id || query.connection_id,
        connectionName: query.connection_name,
        sql: query.sql,
        executedAt: query.executed_at,
        executionTime: query.execution_time,
        rowCount: query.row_count,
        error: query.error
      }))
    } catch (error) {
      console.error("Error searching queries:", error)
      return []
    }
  }

  async clearAll() {
    // This would need to delete all records - implement with caution
    // For now, return a warning
    toast.warning("Clear all functionality requires admin permissions")
    return false
  }
}

export default new QueryHistoryService()