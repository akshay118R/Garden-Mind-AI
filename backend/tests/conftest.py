import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Use an isolated test database
TEST_DB_FILE = Path("./test_gardenmind.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["UPLOAD_DIR"] = "./test_uploads"

from app.core.config import settings
from app.db.session import Base, get_db
from app.main import app

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    # Setup test DB tables and test upload dir
    Base.metadata.create_all(bind=test_engine)
    Path("./test_uploads").mkdir(parents=True, exist_ok=True)
    yield
    # Cleanup test DB and test upload dir
    Base.metadata.drop_all(bind=test_engine)
    if TEST_DB_FILE.exists():
        try:
            TEST_DB_FILE.unlink()
        except Exception:
            pass
    import shutil
    if Path("./test_uploads").exists():
        try:
            shutil.rmtree("./test_uploads")
        except Exception:
            pass


@pytest.fixture
def db_session():
    """Provides a fresh transactional session for each test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """Provides a TestClient overriding get_db with TestingSessionLocal."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
