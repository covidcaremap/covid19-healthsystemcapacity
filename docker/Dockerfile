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

# UPenn's CHIME.
# TODO: Update to master if our changes end up being merged.
#       Then when this is published to pypi, move install to requirements.txt

## Streamlit needs a specific older version of datetimeutils. Why.
RUN pip install python-dateutil==2.8.0

## Install chime
RUN mkdir -p /opt/tmp && \
    cd /opt/tmp && \
    git clone --single-branch --depth 1 \
        --branch rde/feature/regional-sir-model https://github.com/lossyrob/chime.git && \
    cd chime && \
    python setup.py install

WORKDIR /opt/src

ENV PYTHONPATH=/opt/src:/opt/lib:$PYTHONPATH

ENTRYPOINT [ "jupyter" ]
CMD [ "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--notebook-dir=/opt/jupyter" ]
