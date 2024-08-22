use std::fs;
use std::io::Write;
use axum::{
    body::Body, routing::{get, post}, Json, Router
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use std::path::Path;
use std::fs::File;
use serde_json;
use axum::{
    middleware,
    http::Request,
    response::Response,
};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde_json::json;

async fn authenticate(
    username: String,
    password: String,
    request: Request<Body>, 
    next: middleware::Next
) -> Response {
    println!("Authenticating request...");

    // Safely get the Authorization header
    let auth_header = match request.headers().get("Authorization") {
        Some(header) => header,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "message": "Missing Authorization header.",
                    "success": false
                }))
            ).into_response();
        }
    };

    // Safely convert the header to a string and split it
    let authentication = match auth_header.to_str() {
        Ok(auth_str) => auth_str.split(":").collect::<Vec<&str>>(),
        Err(_) => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "message": "Invalid Authorization header format.",
                    "success": false
                }))
            ).into_response();
        }
    };

    // Check if we have both username and password
    if authentication.len() != 2 {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "message": "Invalid Authorization header format.",
                "success": false
            }))
        ).into_response();
    }

    let (auth_username, auth_password) = (authentication[0], authentication[1]);

    if (auth_username != username) || (auth_password != password) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "message": "Unauthorized.",
                "success": false
            }))
        ).into_response();
    }

    // Authentication successful, proceed with the request
    next.run(request).await
}

#[tokio::main]
async fn main() {
    let config_path = "/Users/incog/Desktop/uni/config.json";

    let config = get_config(config_path);

    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /create-file` goes to `create_file`
        .route("/create-file", post(|json | create_file(json, config.store, config.log_file)))
        .layer(middleware::from_fn(move |req, next| {
            let username = config.username.clone();
            let password = config.password.clone();
            authenticate(username, password, req, next)
        }));

    // Run our app with hyper, listening globally on given port
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", config.server_port)).await.unwrap();
    println!("Listening on port {}", config.server_port);
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Hello, World!"
}

async fn create_file(Json(request): Json<StoreRequest>, store_path: String, log_file_path: String) -> Json<StoreResponse> {

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

    // Ensure the directory exists
    let dir_path = Path::new(&store_path);
    if !dir_path.exists() {
        fs::create_dir_all(&store_path).unwrap();
    }

    // Write the file to disk
    let file_path = format!("{}/{}.{}", store_path, id, request.file_extension);
    let mut file = fs::OpenOptions::new()
        .create(true)
        .write(true)
        .open(&file_path)
        .unwrap();

    file.write_all(&request.content).unwrap();

    println!("File written to disk: {}", file_path);
    println!("Logging file...");

    // Read the log file
    let log_file_path = Path::new(&log_file_path);
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

fn get_config(config_path: &str) -> Config {
    let config_path = Path::new(config_path);
    let config_file = File::open(config_path).unwrap();
    serde_json::from_reader(config_file).unwrap()
}

#[derive(Debug, Deserialize, Serialize)]
struct Config {
    username: String,
    password: String,
    store: String,
    log_file: String,
    server_port: u16,
}

#[derive(Deserialize)]
struct StoreRequest {
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