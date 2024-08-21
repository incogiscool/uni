use std::fs;
use std::io::Write;
use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use std::path::Path;
use std::fs::File;
use serde_json;

#[tokio::main]
async fn main() {
    let port = 7777;

    // initialize tracing
    tracing_subscriber::fmt::init();

    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /create-file` goes to `create_file`
        .route("/create-file", post(create_file));

    // run our app with hyper, listening globally on port 7777
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await.unwrap();
    println!("Listening on port {}", port);
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Hello, World!"
}

async fn create_file(Json(request): Json<StoreRequest>) -> Json<StoreResponse> {
    // Add authentication here

    println!("Creating file...");

    let id = Uuid::new_v4();
    let now = Utc::now().timestamp_millis();

    let log = Log {
        timestamp: now,
        file_name: request.file_name.clone(),
        id: id.to_string(),
        file_extension: request.file_extension.clone(),
    };

    println!("{:?}", log);
    
    // Write the file to disk
    let file_path = format!("store/{}.{}", id, request.file_extension);
    let mut file = fs::OpenOptions::new()
        .create(true)
        .write(true)
        .open(&file_path)
        .unwrap();

    file.write_all(&request.content).unwrap();

    // Read the log file
    let log_file_path = Path::new("store/log.json");
    let mut logs: Vec<Log> = if log_file_path.exists() {
        let file = File::open(log_file_path).unwrap();
        serde_json::from_reader(file).unwrap_or_else(|_| Vec::new())
    } else {
        Vec::new()
    };

    // Append the new log entry to the existing logs
    logs.push(log);

    // Write the updated logs back to the log file
    let log_file = File::create(log_file_path).unwrap();
    serde_json::to_writer_pretty(log_file, &logs).unwrap();

    println!("File created: {}", file_path);

    Json(StoreResponse {
        message: format!("File created: {}", id),
        success: true,
    })
}

#[derive(Deserialize)]
struct StoreRequest {
    username: String,
    password: String,
    content: Vec<u8>,
    file_name: String,
    file_extension: String,
}

#[derive(Serialize)]
struct StoreResponse {
    message: String,
    success: bool,
}

#[derive(Debug, Deserialize, Serialize)]
struct Log {
    timestamp: i64,
    file_name: String,
    id: String,
    file_extension: String,
}