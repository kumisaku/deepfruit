FROM tensorflow/tensorflow:2.17.0

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir fastapi==0.115.0 "uvicorn[standard]==0.30.6" pillow==10.4.0 python-multipart==0.0.9

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
