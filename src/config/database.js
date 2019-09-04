require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // data de criação e alteração
    underscored: true, // coloca o nome como userGroup -> user_group
    underscoredAll: true, // o mesmo conceito de cima porem para colunas
  },
};
