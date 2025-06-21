// model-compatibility-layer.js
function extendModels(models) {
  Object.values(models).forEach(model => {
    if (model && model.prototype) {
      // Override toJSON to provide compatibility between camelCase and snake_case
      const originalToJSON = model.prototype.toJSON;
      model.prototype.toJSON = function() {
        const values = originalToJSON ? originalToJSON.call(this) : { ...this.dataValues };
        
        // Add snake_case equivalents for common camelCase attributes
        const camelToSnakeMap = {
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          isActive: 'is_active',
          isDeleted: 'is_deleted',
          firstName: 'first_name',
          lastName: 'last_name',
          lastLogin: 'last_login'
        };
        
        // For each camelCase attribute, check if we need to add its snake_case equivalent
        Object.entries(camelToSnakeMap).forEach(([camel, snake]) => {
          if (values[camel] !== undefined && values[snake] === undefined) {
            values[snake] = values[camel];
          } else if (values[snake] !== undefined && values[camel] === undefined) {
            values[camel] = values[snake];
          }
        });
        
        return values;
      };
      
      // Override get method to provide compatibility for accessing attributes
      const originalGet = model.prototype.get;
      model.prototype.get = function(key, options) {
        // Try original get first
        const value = originalGet ? originalGet.call(this, key, options) : this.dataValues[key];
        
        if (value !== undefined) return value;
        
        // If original get returns undefined, try converting between naming conventions
        const camelToSnake = {
          'createdAt': 'created_at',
          'updatedAt': 'updated_at',
          'isActive': 'is_active',
          'isDeleted': 'is_deleted',
          'firstName': 'first_name',
          'lastName': 'last_name',
          'lastLogin': 'last_login'
        };
        
        const snakeToCamel = Object.entries(camelToSnake).reduce((acc, [camel, snake]) => {
          acc[snake] = camel;
          return acc;
        }, {});
        
        // If key is camelCase, try snake_case
        if (camelToSnake[key]) {
          return originalGet ? originalGet.call(this, camelToSnake[key], options) : this.dataValues[camelToSnake[key]];
        }
        
        // If key is snake_case, try camelCase
        if (snakeToCamel[key]) {
          return originalGet ? originalGet.call(this, snakeToCamel[key], options) : this.dataValues[snakeToCamel[key]];
        }
        
        return undefined;
      };
    }
  });
}

module.exports = { extendModels };
