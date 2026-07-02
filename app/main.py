from __future__ import annotations

import csv
import io
import os
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static"
PUBLIC_DIR = Path(os.getenv("PUBLIC_DIR", "/tmp/csv-processor-public"))


@dataclass(frozen=True)
class CsvProduct:
    product_id: str
    name: str
    value: Decimal


class CsvValidationError(ValueError):
    pass


def parse_csv_content(content: bytes) -> list[CsvProduct]:
    text = content.decode("utf-8-sig")
    reader = csv.reader(io.StringIO(text))
    products: list[CsvProduct] = []

    for line_number, row in enumerate(reader, start=1):
        if not row:
            continue
        if len(row) != 3:
            raise CsvValidationError(f"Line {line_number}: expected 3 columns, found {len(row)}")

        product_id, name, raw_value = [field.strip() for field in row]
        if not product_id:
            raise CsvValidationError(f"Line {line_number}: product id is required")
        if not name:
            raise CsvValidationError(f"Line {line_number}: product name is required")

        try:
            value = Decimal(raw_value)
        except InvalidOperation as exc:
            raise CsvValidationError(f"Line {line_number}: value must be numeric") from exc

        products.append(CsvProduct(product_id=product_id, name=name, value=value))

    if not products:
        raise CsvValidationError("CSV file does not contain any product rows")

    return products


def copy_static_assets() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for item in STATIC_DIR.iterdir():
        target = PUBLIC_DIR / item.name
        if item.is_file():
            shutil.copy2(item, target)


def create_s3_client():
    profile = os.getenv("AWS_PROFILE")
    region = os.getenv("AWS_REGION", "eu-west-1")
    if profile:
        session = boto3.Session(profile_name=profile, region_name=region)
    else:
        session = boto3.Session(region_name=region)
    return session.client("s3")


def s3_bucket_name() -> str:
    bucket = os.getenv("S3_BUCKET_NAME", "").strip()
    if not bucket:
        raise RuntimeError("S3_BUCKET_NAME is not configured")
    return bucket


def upload_to_s3(filename: str, content: bytes) -> str:
    bucket = s3_bucket_name()
    prefix = os.getenv("S3_UPLOAD_PREFIX", "processed-csv").strip().strip("/")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    safe_name = Path(filename).name.replace(" ", "-")
    key = f"{prefix}/{timestamp}-{safe_name}" if prefix else f"{timestamp}-{safe_name}"

    create_s3_client().put_object(
        Bucket=bucket,
        Key=key,
        Body=content,
        ContentType="text/csv",
        Metadata={"processed-by": "k8s-csv-processing-platform"},
    )
    return key


def list_processed_files() -> list[dict[str, str]]:
    bucket = s3_bucket_name()
    prefix = os.getenv("S3_UPLOAD_PREFIX", "processed-csv").strip().strip("/")
    response = create_s3_client().list_objects_v2(Bucket=bucket, Prefix=prefix)
    files: list[dict[str, str]] = []
    for item in response.get("Contents", []):
        files.append(
            {
                "key": item["Key"],
                "size": str(item["Size"]),
                "last_modified": item["LastModified"].strftime("%Y-%m-%d %H:%M:%S %Z"),
            }
        )
    return sorted(files, key=lambda item: item["key"], reverse=True)


def build_app() -> FastAPI:
    app = FastAPI(title=os.getenv("APP_TITLE", "K8s CSV Processing Platform"))
    templates = Jinja2Templates(directory=str(APP_DIR / "templates"))

    copy_static_assets()
    app.mount("/static", StaticFiles(directory=str(PUBLIC_DIR)), name="static")

    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}

    @app.get("/", response_class=HTMLResponse)
    def index(request: Request):
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "title": app.title,
                "files": safe_list_processed_files(),
                "error": None,
            },
        )

    @app.get("/files", response_class=HTMLResponse)
    def files(request: Request):
        return templates.TemplateResponse(
            "files.html",
            {
                "request": request,
                "title": app.title,
                "files": safe_list_processed_files(),
                "error": None,
            },
        )

    @app.post("/upload", response_class=HTMLResponse)
    async def upload(request: Request, file: UploadFile = File(...)):
        if not file.filename:
            raise HTTPException(status_code=400, detail="CSV file is required")
        content = await file.read()

        try:
            products = parse_csv_content(content)
            s3_key = upload_to_s3(file.filename, content)
            files = safe_list_processed_files()
        except CsvValidationError as exc:
            return templates.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "title": app.title,
                    "files": safe_list_processed_files(),
                    "error": str(exc),
                },
                status_code=400,
            )
        except (RuntimeError, BotoCoreError, ClientError) as exc:
            return templates.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "title": app.title,
                    "files": [],
                    "error": f"S3 upload failed: {exc}",
                },
                status_code=502,
            )

        return templates.TemplateResponse(
            "result.html",
            {
                "request": request,
                "title": app.title,
                "products": products,
                "row_count": len(products),
                "s3_key": s3_key,
                "files": files,
            },
        )

    return app


def safe_list_processed_files() -> list[dict[str, str]]:
    try:
        return list_processed_files()
    except (RuntimeError, BotoCoreError, ClientError):
        return []


app = build_app()

