import { postgres } from './deps.js';

const sql = postgres({});

const getAllTodos = async () => {
  const todos = await sql`select * from todos`;

  return Response.json(todos);
};

const getTodo = async (_request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;

  try {
    const todos = await sql`select * from todos where id = ${id}`;
    return Response.json(todos[0]);
  } catch (err) {
    return new Response(err.message, { status: 404 });
  }
};

const createTodo = async (request) => {
  try {
    const body = await request.text();
    const json = await JSON.parse(body);

    if (json?.item?.length > 0 || json?.item !== '') {
      await sql`insert into todos (item) values (${json.item})`;
      return Response.json(json, { status: 200 });
    } else {
      return new Response('Cannot create todo!', { status: 400 });
    }
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
};

const deleteTodo = async (_request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;

  try {
    const todo = await sql`delete from todos where id = ${id}`;
    return new Response(null, { status: 204 });
  } catch (err) {
    return new Response(err.message, { status: 404 });
  }
};

const urlMapping = [
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/todos' }),
    fn: getAllTodos,
  },
  {
    method: 'GET',
    pattern: new URLPattern({ pathname: '/todos/:id' }),
    fn: getTodo,
  },
  {
    method: 'POST',
    pattern: new URLPattern({ pathname: '/todos' }),
    fn: createTodo,
  },
  {
    method: 'DELETE',
    pattern: new URLPattern({ pathname: '/todos/:id' }),
    fn: deleteTodo,
  },
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response('Not found', { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);

  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500 });
  }
};

const handleHttpConnection = async (conn) => {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    requestEvent.respondWith(await handleRequest(requestEvent.request));
  }
};

const portConfig = { port: 7777, hostname: '0.0.0.0' };

for await (const conn of Deno.listen(portConfig)) {
  handleHttpConnection(conn);
}
