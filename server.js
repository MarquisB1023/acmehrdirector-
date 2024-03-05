const express = require("express");

const app = express();
const path = require("path");
const pg = require("pg");

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost/acme_employees_departments_db"
);
client.connect();
app.use(require("morgan")("dev"));
app.use(express.json());
const port = 3000;
const init = () => {
  const SQL = `
    DROP TABLE IF EXISTS departments CASCADE;
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    DROP TABLE IF EXISTS employees;
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      department_id INTEGER REFERENCES departments(id) NOT NULL
    );

    INSERT INTO departments (name) VALUES ('information technology');
    INSERT INTO departments (name) VALUES ('human resources');
    INSERT INTO departments (name) VALUES ('production');
    INSERT INTO departments (name) VALUES ('marketing');

    INSERT INTO employees (name, department_id) SELECT 'Alica', id FROM departments WHERE name = 'information technology';
    INSERT INTO employees (name, department_id) SELECT 'Shannah', id FROM departments WHERE name = 'human resources';
    INSERT INTO employees (name, department_id) SELECT 'Lenard', id FROM departments WHERE name = 'production';
    INSERT INTO employees (name, department_id) SELECT 'Terrance', id FROM departments WHERE name = 'marketing';
  `;
  const response = client.query(SQL);
  app.listen(port, () => {
    console.log(
      "I' am listeing at port " + port + "and  the database should be seeded"
    );
  });
};

init();

app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
        SELECT * FROM departments;
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
        SELECT  id, name, department_id  FROM employees;
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/employees", async (req, res, next) => {
  try {
    const { name, department_id } = req.body;
    const SQL = `
        INSERT INTO employees(name, department_SELECT VALUES($1, id FROM despartments WHERE name =, $2, $3, (SELECT id from departments where name = $4))
        RETURNING *;
        `;
    const response = await client.query(SQL, [name, department_id]);
    res.send(response.rows[0], response.rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
        UPDATE employees
        SET name=$1, department_id =$2
       where id = $3
       RETURNING *;
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.departments,
    ]);
    res.send(response.rows[0], response.rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `
        DELETE FROM employees

       where id = $1;
        `;
    const response = await client.query(SQL, [id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
