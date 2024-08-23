use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::delete;
use axum::{
    body::Body,
    routing::{get, post},
    Json, Router,
};
use axum::{middleware, response::Response};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json;
use serde_json::json;
use std::fs;
use std::fs::File;
use std::io::{BufReader, Read, Write};
use std::path::Path;
use uuid::Uuid;
use axum::http::{HeaderValue, Method};
use tower_http::cors::{Any, CorsLayer};

async fn authenticate(
    username: String,
    password: String,
    request: Request<Body>,
    next: middleware::Next,
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
                })),
            )
                .into_response();
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
                })),
            )
                .into_response();
        }
    };

    // Check if we have both username and password
    if authentication.len() != 2 {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "message": "Invalid Authorization header format.",
                "success": false
            })),
        )
            .into_response();
    }

    let (auth_username, auth_password) = (authentication[0], authentication[1]);

    if (auth_username != username) || (auth_password != password) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "message": "Unauthorized.",
                "success": false
            })),
        )
            .into_response();
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

        // Create a CORS layer
        let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::DELETE])
        .allow_headers(Any);


    // Build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /create-file` goes to `create_file`
        .route("/upload", {
            let store = config.store.clone();
            let log_file = config.log_file.clone();
            post(move |json| create_file(json, store.clone(), log_file.clone()))
        })
        .route("/logs", {
            let log_file = config.log_file.clone();
            get(move |_: Request<Body>| get_logs(log_file.clone()))
        })
        .route("/files/:id", {
            let store = config.store.clone();
            let log_file = config.log_file.clone();
            get(move |request: Request<Body>| get_file(request, store.clone(), log_file.clone()))
        })
        .route("/files/:id", {
            let store = config.store.clone();
            let log_file = config.log_file.clone();
            delete(move |request: Request<Body>| delete_file(request, store.clone(), log_file.clone()))
        })
        .layer({
            let username = config.username.clone();
            let password = config.password.clone();
            middleware::from_fn(move |req, next| {
                authenticate(username.clone(), password.clone(), req, next)
            })
        })
        .layer(cors);

    // Run our app with hyper, listening globally on given port
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", config.server_port))
        .await
        .unwrap();
    println!("Listening on port {}", config.server_port);
    axum::serve(listener, app).await.unwrap();
}

// use this for temp auth (middleware authenticates all requests) but replacw with session based auth
async fn root() -> &'static str {
    "Hello, World!"
}

fn read_log_file(log_file_path: String) -> Vec<Log> {
    // Read the log file
    let log_file_path = Path::new(&log_file_path);
    let logs: Vec<Log> = if log_file_path.exists() {
        let file = File::open(log_file_path).unwrap();
        serde_json::from_reader(file).unwrap_or_else(|_| Vec::new())
    } else {
        Vec::new()
    };

    return logs
}

async fn delete_file(request: Request<Body>, store_path: String, log_file_path: String) -> Json<StoreResponse> {
    println!("Deleting file...");

    let id = request.uri().path().trim_start_matches("/files/");

    let logs = read_log_file(log_file_path.clone());
    let log = logs.iter().find(|log| log.id == id).unwrap();

    let file_path = format!("{}/{}.{}", store_path, id, log.file_extension);
    println!("File path: {}", &file_path);

    let _ = fs::remove_file(&file_path);

    println!("File deleted: {}", file_path);
    println!("Logging file...");

    // Read the log file
    let log_file_path = Path::new(&log_file_path);
    let mut logs: Vec<Log> = if log_file_path.exists() {
        let file = File::open(log_file_path).unwrap();
        serde_json::from_reader(file).unwrap_or_else(|_| Vec::new())
    } else {
        Vec::new()
    };

    // Remove the log entry from the existing logs
    logs.retain(|log| log.id != id);

    // Write the updated logs back to the log file
    let log_file = File::create(log_file_path).unwrap();
    serde_json::to_writer_pretty(log_file, &logs).unwrap();

    println!("File deleted: {}", file_path);

    Json(StoreResponse {
        message: format!("File deleted: {}", id),
        success: true,
        data: None,
    })
}

async fn get_logs(log_file_path: String) -> Json<StoreResponse> {
    println!("Getting files...");

    let logs = read_log_file(log_file_path);

    Json(StoreResponse {
        message: "Successfully retrieved logs.".to_string(),
        success: true,
        data: Some(ResponseData::MultipleLogs(logs)),
    })
}

async fn get_file(request: Request<Body>, store_path: String, log_file_path: String) -> Json<StoreResponse> {
    println!("Retrieving file...");

    let id = request.uri().path().trim_start_matches("/files/");

    let logs = read_log_file(log_file_path);
    let log = logs.iter().find(|log| log.id == id).unwrap();

    let file_path = format!("{}/{}.{}", store_path, id, log.file_extension);
    println!("File path: {}", &file_path);

    let file = File::open(file_path);
    

    match file {
        Ok(file) => {
            let mut file = BufReader::new(file);
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer).unwrap();

            let file_with_content = FileWithContent {
                file_name: log.file_name.clone(),
                file_extension: log.file_extension.clone(),
                content: buffer,
                id: log.id.clone(),
                timestamp: log.timestamp,
            };
            
            Json(StoreResponse {
                message: "Successfully retrieved file.".to_string(),
                success: true,
                data: Some(ResponseData::FileWithContent(file_with_content)),
            })
        }
        Err(_) => {
            Json(StoreResponse {
                message: "Failed to retrieve file.".to_string(),
                success: false,
                data: None,
            })
        }
    }
}

async fn create_file(
    Json(request): Json<StoreRequest>,
    store_path: String,
    log_file_path: String,
) -> Json<StoreResponse> {
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
    logs.push(log.clone());

    // Write the updated logs back to the log file
    let log_file = File::create(log_file_path).unwrap();
    serde_json::to_writer_pretty(log_file, &logs).unwrap();

    println!("File created: {}", file_path);

    Json(StoreResponse {
        message: format!("File created: {}", id),
        success: true,
        data: Some(ResponseData::SingleLog(log)),
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
enum ResponseData {
    SingleLog(Log),
    FileWithContent(FileWithContent),
    MultipleLogs(Vec<Log>),
}

#[derive(Serialize)]
struct StoreResponse {
    message: String,
    success: bool,
    data: Option<ResponseData>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Log {
    timestamp: i64,
    file_name: String,
    id: String,
    file_extension: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct FileWithContent {
    file_name: String,
    file_extension: String,
    id: String,
    timestamp: i64,
    content: Vec<u8>,
}