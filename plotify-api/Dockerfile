FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install -y libgeos-dev libgl1-mesa-glx
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --no-deps inkex
EXPOSE 80
CMD ["fastapi", "run", "--port", "80", "index.py"]