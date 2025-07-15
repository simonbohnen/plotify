FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install -y libgeos-dev libgl1-mesa-glx
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --no-deps inkex
RUN pip install --no-cache-dir --no-deps git+https://github.com/KennethJAllen/proper-pixel-art.git#egg=proper_pixel_art
ARG REPLICATE_API_TOKEN
ARG VECTORIZER_AI_API_ID
ARG VECTORIZER_AI_API_SECRET
ENV REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
ENV VECTORIZER_AI_API_ID=${VECTORIZER_AI_API_ID}
ENV VECTORIZER_AI_API_SECRET=${VECTORIZER_AI_API_SECRET}
EXPOSE 80
CMD ["fastapi", "run", "--port", "80", "--workers", "4", "index.py"]