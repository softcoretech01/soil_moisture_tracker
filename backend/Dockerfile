FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies for MySQL and building Python packages
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Command to run your FastAPI/Uvicorn app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
