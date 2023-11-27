# unServer

### Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

Create controller, model and router files:

```
# Showing help
deno task create -h
deno task create --help

# Running without options
deno task create [filename]

# Creating all files
deno task create -A
deno task create --create-all

# Creating controller file
deno task create -c
deno task create --create-controller

# Creating model file
deno task create -m
deno task create --create-model

# Creating router file
deno task create -r
deno task create --create-router
```

### TODO

- Migrate cli for hono
- Migrate from djwt to hono/helper
- Fix a issue where work title could not be changed
- Add image uploader to supabase