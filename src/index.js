const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

//aqui criando a lista vazia dos usuários
const users = [];

//configuração do Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers; //pegando o username no header da requisição 
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User does not found' });
  }

  request.user = user;
  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body; // a rota deve receber (name) e (username) dentro do corpo da requisiçao
  const userExists = users.find(user => user.username === username)

  if (userExists) {
    return response.status(400).json({ error: 'Username already exists' })
  }

  //criação do objeto
  const user = {
    id: uuidv4(), //aqui fera um tokem pelo uuid
    name,
    username,
    todos: []
  }

  //aqui empurra a dados criados para dentro da lista, ela foi criada na linha 12 como const
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo){
    return response.status(404).json({error: 'Todo not found'});
  }

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo){
    return response.status(404).json({error: 'Todo not found'});
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (!todoIndex === -1){
    return response.status(404).json({error: 'Todo not found'});
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();

});

module.exports = app;