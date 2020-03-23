FROM python:3

RUN apt-get update && apt-get install --no-install-recommends -y \
     libspatialindex-dev \
     unzip && \
     rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y nodejs npm

# Install Tippecanoe
RUN cd /tmp && \
     wget https://github.com/mapbox/tippecanoe/archive/1.32.5.zip && \
     unzip 1.32.5.zip && \
     cd tippecanoe-1.32.5 && \
     make && \
     make install

# Install mbutils
RUN cd /opt && \
    wget https://github.com/mapbox/mbutil/archive/v0.3.0.zip && \
    unzip v0.3.0.zip && \
    ln -s `pwd`/mbutil-0.3.0/mb-util /usr/local/bin/mb-util

COPY notebooks/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

WORKDIR /opt/src

ENV PYTHONPATH=/opt/src:$PYTHONPATH

ENTRYPOINT [ "jupyter" ]
CMD [ "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--notebook-dir=/opt/jupyter" ]
