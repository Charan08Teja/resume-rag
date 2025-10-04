const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  },
  salary: {
    type: DataTypes.STRING
  },
  employmentType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    defaultValue: 'full-time'
  },
  postedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'jobs'
});

// Relationships
User.hasMany(Job, { foreignKey: 'postedBy', as: 'PostedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'PostedBy' });

module.exports = Job;
