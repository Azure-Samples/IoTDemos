FROM ubuntu:xenial

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libcurl4-openssl-dev python3-pip libboost-python1.58-dev libpython3-dev && \
    rm -rf /var/lib/apt/lists/* 

RUN pip3 install --upgrade pip
RUN pip install setuptools
RUN pip install ptvsd==4.1.3
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

RUN useradd -ms /bin/bash moduleuser
USER moduleuser

CMD [ "python3", "-u", "./main.py" ]
