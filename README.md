# Uni - Open source locally hosted file storage platform

Uni is a free and open source file storage platform that allows you to use your own infrastructure to store and share files.

**NOTE: This is a work in progress. I am not a rust server developer, so I'm sure there are many bugs and missing features. If you find any, please open an issue.**

## Demo

INSERT DEMO HERE

## Running the project locally

### Prerequisites

- Rust
- Node.js

### Setup

1. Install the dependencies for frontend and run:

```
cd frontend
npm install
npm run dev
cd ..
```

**Create a `.env` file in the frontend file with the following content:**

```
NEXT_PUBLIC_API_URL="http://localhost:7777"
```

Dont forget to change the port to the one you are using (can be changed in the config.json file)

2. Install the dependencies for backend and run:

```
cd backend
cargo install
cargo run
cd ..
```

3. Open your browser and navigate to `http://localhost:3000`

Server should be running on `http://localhost:7777` by default and can be changed through the `config.json` file.

4. Configuring the server

You can configure the server by editing the `config.json` file. The file contains the following fields:

- `username`: The username for the server.
- `password`: The password for the server.
- `store`: The path to the store (storage) directory.
- `log_file`: The path to the log file.
- `server_port`: The port to use for the server.

## Hosting the project on domain through Nginx

ADD NGINX CONFIG HERE

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
