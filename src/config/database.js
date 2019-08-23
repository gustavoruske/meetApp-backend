module.exports = {
  dialect: 'postgres',
  host: '192.168.99.100',
  username: 'postgres',
  password: 'docker',
  database: 'meetapp',
  define: {
    timestamps: true, // data de criação e alteração
    underscored: true, // coloca o nome como userGroup -> user_group
    underscoredAll: true, // o mesmo conceito de cima porem para colunas
  },
};
