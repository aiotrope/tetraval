# tetraval
DBSWA assignment: Load Balancer for TODO API

## CLI Commands
Running to port 7800 instead of port 7777 due to load balancing

```bash
# build todo-api
$ cd todo-api && docker build -t todo-api .

# start container at the root directory
$ cd tetraval && docker compose up

# stop running container
$ docker compose down
```