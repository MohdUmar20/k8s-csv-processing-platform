from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.main import CsvValidationError, app, parse_csv_content


def test_parse_csv_content_accepts_assignment_format():
    rows = parse_csv_content(b'"211627629","Purple Safi Kaftan","4900.0000"\n')

    assert len(rows) == 1
    assert rows[0].product_id == "211627629"
    assert rows[0].name == "Purple Safi Kaftan"
    assert rows[0].value == Decimal("4900.0000")


def test_parse_csv_content_ignores_blank_rows():
    rows = parse_csv_content(b'"1","Name","10.00"\n\n"2","Other","20.00"\n')

    assert [row.product_id for row in rows] == ["1", "2"]


def test_parse_csv_content_rejects_wrong_column_count():
    with pytest.raises(CsvValidationError, match="expected 3 columns"):
        parse_csv_content(b'"1","missing value"\n')


def test_parse_csv_content_rejects_invalid_number():
    with pytest.raises(CsvValidationError, match="value must be numeric"):
        parse_csv_content(b'"1","Name","abc"\n')


def test_healthz():
    client = TestClient(app)

    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

