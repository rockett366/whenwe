from app.database import SessionLocal, engine
from app import models, utils

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()

    # Optional: clear any old users (for development seeding)
    db.query(models.User).delete()

    # Demo users
    users = [
        models.User(
            username="alice",
            email="alice@example.com",
            first_name="Alice",
            last_name="Wonder",
            password_hash=utils.hash_password("password123"),
        ),
        models.User(
            username="bob",
            email="bob@example.com",
            first_name="Bob",
            last_name="Builder",
            password_hash=utils.hash_password("password123"),
        ),
        models.User(
            username="charlie",
            email="charlie@example.com",
            first_name="Charlie",
            last_name="Brown",
            password_hash=utils.hash_password("password123"),
        ),
    ]

    db.add_all(users)
    db.commit()
    db.close()

    print("✅ Users successfully seeded!")

if __name__ == "__main__":
    seed_users()