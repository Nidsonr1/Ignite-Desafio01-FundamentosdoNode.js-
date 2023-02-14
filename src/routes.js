import { randomUUID } from 'node:crypto';

import { buildRoutePath } from "./utils/build-route-path.js"
import { Database } from "./database.js";

const database = new Database();

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      database.insert('tasks', task);
      return res.writeHead(201).end()
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const searchData = search ? {
        title: search,
        description: search,
      } : null;

      const tasks = database.select('tasks', searchData)

      return res.end(JSON.stringify(tasks));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:taskId'),
    handler: (req, res) => {
      const { taskId } = req.params;
      const { title, description } = req.body;


      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        );
      }

      const [taskExist] = database.select('tasks', {
        id: taskId
      });

      if (!taskExist) {
        return res.writeHead(404).end()
      }

      database.update('tasks', taskId, {
        title,
        description,
        updated_at: new Date()
      });

      return res.end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:taskId'),
    handler: (req, res) => {
      const { taskId } = req.params;

      const [taskExist] = database.select('tasks', { id: taskId });

      if (!taskExist) {
        return res.writeHead(404).end();
      }

      database.delete('tasks', taskId);

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:taskId'),
    handler: (req, res) => {
      const { taskId } = req.params;

      const [taskExist] = database.select('tasks', { id: taskId });

      if (!taskExist) {
        return res.writeHead(404).end();
      }

      const isCompleted = !!taskExist.completed_at
      const completed_at = isCompleted ? null : new Date()

      database.update('tasks', taskId, { completed_at })

      return res.writeHead(204).end();
    }
  }
]